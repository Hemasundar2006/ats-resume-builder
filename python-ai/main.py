import io
import json
import os
import re
from typing import Optional

import pdfplumber
import requests
from docx import Document
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


load_dotenv()

app = FastAPI(title="ATS Resume Builder - AI Service")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "https://ats-resume-builder-neon.vercel.app",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


class ScoreRequest(BaseModel):
    resume_text: str
    job_description: str


class StandaloneScoreRequest(BaseModel):
    resume_text: str


class RefineRequest(BaseModel):
    summary: str
    target_role: Optional[str] = "Professional"
    format: Optional[str] = "balanced"  # balanced, impactful, concise, technical


def call_gemini_api(prompt: str) -> Optional[str]:
    if not GEMINI_API_KEY:
        return None

    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    )
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return None


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return "\n".join([(p.extract_text() or "") for p in pdf.pages]).strip()
    except Exception:
        return ""


def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs]).strip()
    except Exception:
        return ""


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def extract_contact_info(text: str) -> dict:
    email_regex = r"[\w\.-]+@[\w\.-]+\.\w+"
    phone_regex = r"(\+\d{1,3}[-\.\s]??\d{10}|\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{10,13})"
    linkedin_regex = r"linkedin\.com/(?:in/)?([a-zA-Z0-9-]+)"
    github_regex = r"github\.com/([a-zA-Z0-9-]+)"
    portfolio_patterns = r"(?:https?://)?([a-zA-Z0-9.-]+\.(?:vercel\.app|netlify\.app|github\.io|com|me|info|io)(?:/[^\s|]*)?)"

    emails = re.findall(email_regex, text)
    phones = re.findall(phone_regex, text)
    linkedins = re.findall(linkedin_regex, text, re.IGNORECASE)
    githubs = re.findall(github_regex, text, re.IGNORECASE)
    portfolios = re.findall(portfolio_patterns, text, re.IGNORECASE)

    valid_portfolios = [
        p
        for p in portfolios
        if len(p) > 6
        and "."
        in p
        and not any(
            x in p.lower()
            for x in ["linkedin", "github", "google", "gmail", ".js", ".css", "w3.org"]
        )
    ]

    return {
        "email": (emails[0] if emails else "").lower(),
        "phone": phones[0] if phones else "",
        "linkedin": (f"linkedin.com/in/{linkedins[0]}" if linkedins else "").lower(),
        "github": (f"github.com/{githubs[0]}" if githubs else "").lower(),
        "portfolio": (valid_portfolios[0].rstrip(",.") if valid_portfolios else "").lower(),
    }


def extract_candidate_name(raw_text: str) -> str:
    lines = [l.strip() for l in (raw_text or "").splitlines() if l.strip()]
    if not lines:
        return "Candidate Name"

    for line in lines[:5]:
        lower = line.lower()
        if any(x in lower for x in ["@", "http", "linkedin", "github", "phone"]):
            continue
        if len(line) <= 60 and re.fullmatch(r"[A-Za-z][A-Za-z .'-]{1,59}", line):
            return line.strip()

    return lines[0][:60]


def keyword_set(text: str) -> set[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.]{1,}", (text or "").lower())
    stop = set(ENGLISH_STOP_WORDS) | {"resume", "job", "description"}
    return {t for t in tokens if t not in stop and len(t) > 1}


def tfidf_score_and_keywords(resume_text: str, jd_text: str) -> tuple[int, list[str], list[str]]:
    resume = clean_text(resume_text)
    jd = clean_text(jd_text)
    if not resume or not jd:
        return 0, [], []

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=2500,
    )
    tfidf = vectorizer.fit_transform([resume, jd])
    sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    score = int(round(sim * 100))

    feature_names = vectorizer.get_feature_names_out()
    jd_vec = tfidf[1].toarray().ravel()
    resume_vec = tfidf[0].toarray().ravel()

    top_idx = jd_vec.argsort()[::-1][:40]
    jd_top = [feature_names[i] for i in top_idx if jd_vec[i] > 0]

    resume_terms = {feature_names[i] for i in resume_vec.argsort()[::-1][:120] if resume_vec[i] > 0}

    matched = [t for t in jd_top if t in resume_terms]
    missing = [t for t in jd_top if t not in resume_terms]

    return score, matched[:30], missing[:30]


def standalone_resume_score(resume_text: str) -> dict:
    text = (resume_text or "").strip()
    if not text:
        return {
            "resume_score": 0,
            "subscores": {},
            "signals": {"issues": ["Empty resume text"], "strengths": []},
        }

    lower = text.lower()
    issues: list[str] = []
    strengths: list[str] = []

    # Basic presence checks
    has_email = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text))
    has_phone = bool(re.search(r"(\+\d{1,3}[-\.\s]??\d{8,}|\(?\d{3}\)?[-\.\s]??\d{3}[-\.\s]??\d{4})", text))
    has_links = ("linkedin.com" in lower) or ("github.com" in lower) or ("http://" in lower) or ("https://" in lower)

    # Section-ish keywords
    section_hits = {
        "summary": any(k in lower for k in ["summary", "objective", "profile", "about"]),
        "experience": any(k in lower for k in ["experience", "work history", "employment"]),
        "education": "education" in lower,
        "skills": "skills" in lower,
        "projects": "projects" in lower,
    }

    # Impact signals
    action_verbs = [
        "built", "created", "developed", "designed", "led", "managed", "owned", "delivered", "improved",
        "optimized", "implemented", "launched", "scaled", "reduced", "increased", "automated", "migrated",
    ]
    verb_hits = sum(1 for v in action_verbs if re.search(rf"\b{re.escape(v)}\b", lower))
    has_metrics = bool(re.search(r"\b\d+(\.\d+)?\s*(%|k|m|b|ms|s|x)\b|\b\d{4}\b", lower))
    bullet_like = len(re.findall(r"(^|\n)\s*[-•*➢]\s+", resume_text))

    # Content density
    word_count = len(re.findall(r"\b\w+\b", text))
    uniq_terms = len(keyword_set(text))

    # Subscores (0..100)
    contact_score = int(round((has_email + has_phone + has_links) / 3 * 100))
    structure_score = int(round(sum(1 for v in section_hits.values() if v) / len(section_hits) * 100))
    impact_score = min(100, int(round((verb_hits / 6) * 60 + (30 if has_metrics else 0) + (10 if bullet_like >= 5 else 0))))
    length_score = 100 if 250 <= word_count <= 900 else (70 if 150 <= word_count <= 1200 else 40)
    skills_score = min(100, int(round((uniq_terms / 80) * 100)))

    if not has_email:
        issues.append("Missing email")
    if not has_phone:
        issues.append("Missing phone number")
    if not any(section_hits.values()):
        issues.append("No clear sections detected (Summary/Experience/Education/Skills/Projects)")
    if not has_metrics:
        issues.append("Add measurable impact (numbers, %, time saved, revenue, users, etc.)")
    if bullet_like < 3:
        issues.append("Use more bullet points for achievements (3–6 per role/project)")
    if word_count < 150:
        issues.append("Resume is very short; add more detail to experience/projects")

    if contact_score >= 67:
        strengths.append("Contact information looks complete")
    if structure_score >= 60:
        strengths.append("Good section structure")
    if impact_score >= 60:
        strengths.append("Strong action/impact language")
    if skills_score >= 60:
        strengths.append("Good keyword/skill coverage")

    resume_score = int(round(
        0.20 * contact_score
        + 0.25 * structure_score
        + 0.30 * impact_score
        + 0.15 * skills_score
        + 0.10 * length_score
    ))

    return {
        "resume_score": resume_score,
        "subscores": {
            "contact": contact_score,
            "structure": structure_score,
            "impact": impact_score,
            "skills": skills_score,
            "length": length_score,
        },
        "signals": {
            "word_count": word_count,
            "unique_terms": uniq_terms,
            "issues": issues[:8],
            "strengths": strengths[:8],
        },
    }


@app.get("/")
def read_root():
    return {"status": "AI service is running", "nlp": "tfidf-regex"}


@app.post("/api/v1/extract")
async def extract_resume(file: UploadFile = File(...)):
    contents = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        raw_text = extract_text_from_pdf(contents)
    elif filename.endswith(".docx"):
        raw_text = extract_text_from_docx(contents)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the file.")

    contact = extract_contact_info(raw_text)
    name = extract_candidate_name(raw_text)

    template = "classic"
    lowered = raw_text.lower()
    if any(k in lowered for k in ["react", "node", "fastapi", "backend", "frontend", "software", "developer", "engineer"]):
        template = "modern"
    elif any(k in lowered for k in ["doctor", "nurse", "clinical", "hospital", "healthcare"]):
        template = "healthcare"
    elif any(k in lowered for k in ["designer", "ui/ux", "photoshop", "illustrator"]):
        template = "creative"

    skills = sorted(list(keyword_set(raw_text)))[:80]

    if GEMINI_API_KEY:
        extraction_prompt = f"""
Task: Extract all information from this resume text into a structured JSON object.
Candidate: {name}

Format:
{{
  "personalInfo": {{ "fullName": "", "email": "", "phone": "", "linkedin": "", "github": "", "portfolio": "" }},
  "summary": "...",
  "experience": [{{ "company": "", "jobTitle": "", "startDate": "", "endDate": "", "description": [] }}],
  "education": [{{ "institution": "", "degree": "", "fieldOfStudy": "", "graduationYear": "", "gpa": "" }}],
  "skills": [],
  "projects": [{{ "title": "", "technologies": [], "description": [], "link": "" }}],
  "certifications": [],
  "achievements": [],
  "selectedTemplate": "{template}"
}}

Text:
"{raw_text}"
"""
        ai_data_raw = call_gemini_api(extraction_prompt)
        if ai_data_raw:
            try:
                json_str = re.sub(r"```[a-z]*\n|```", "", ai_data_raw).strip()
                return json.loads(json_str)
            except Exception:
                pass

    return {
        "raw_text": raw_text,
        "personalInfo": {
            "fullName": name.title(),
            "email": contact["email"],
            "phone": contact["phone"],
            "linkedin": contact["linkedin"],
            "github": contact["github"],
            "portfolio": contact["portfolio"],
        },
        "summary": clean_text(raw_text)[:1000],
        "experience": [],
        "education": [],
        "skills": skills,
        "projects": [],
        "certifications": [],
        "achievements": [],
        "selectedTemplate": template,
    }


@app.post("/api/v1/score")
def score_resume(req: ScoreRequest):
    score, matched, missing = tfidf_score_and_keywords(req.resume_text, req.job_description)
    return {"ats_score": score, "matched_keywords": matched, "missing_keywords": missing}


@app.post("/api/v1/score-standalone")
def score_resume_standalone(req: StandaloneScoreRequest):
    return standalone_resume_score(req.resume_text)


@app.post("/api/v1/refine-summary")
async def refine_summary(req: RefineRequest):
    if not req.summary or not req.summary.strip():
        raise HTTPException(status_code=400, detail="Summary cannot be empty")

    target_role = req.target_role or "Professional"

    if GEMINI_API_KEY:
        prompt = f"""
Task: Refine this professional summary to be ATS-friendly.
Role: {target_role}
Mode: {req.format}

Rules:
- Professional tone, no first-person pronouns.
- High impact verbs.
- Focus on keywords for {target_role}.
- Return ONLY the refined text.

Text: "{req.summary}"
"""
        refined = call_gemini_api(prompt)
        if refined:
            refined = re.sub(r"```[a-z]*|```|^[\"']|[\"']$", "", refined).strip()
            return {"refined_summary": refined, "format_used": req.format, "status": "refined-by-gemini"}

    ats_verbs = {
        "led": "Spearheaded",
        "did": "Executed",
        "managed": "Architected",
        "made": "Engineered",
        "improved": "Optimized",
        "changed": "Transformed",
        "found": "Identified",
        "used": "Leveraged",
        "built": "Established",
        "increased": "Amplified",
        "reduced": "Mitigated",
    }

    refined_text = req.summary
    for old, new in ats_verbs.items():
        refined_text = re.sub(rf"\b{old}\b", new, refined_text, flags=re.IGNORECASE)

    if req.format == "concise" and len(refined_text) > 300:
        refined_text = refined_text[:300].rstrip() + "..."
    elif req.format == "technical" and "expertise in" not in refined_text.lower():
        refined_text = f"{target_role} with expertise in " + refined_text[0].lower() + refined_text[1:]

    refined_text = refined_text.strip()
    if refined_text and not refined_text.endswith("."):
        refined_text += "."

    return {
        "refined_summary": refined_text,
        "format_used": req.format,
        "status": "refined-locally-fallback",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
