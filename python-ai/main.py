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
    selected_template: Optional[str] = "classic"


class StandaloneScoreRequest(BaseModel):
    resume_text: str
    selected_template: Optional[str] = "classic"


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
        result = data["candidates"][0]["content"]["parts"][0]["text"]
        print(f"DEBUG: Gemini API call successful for prompt length {len(prompt)}")
        return result
    except Exception as e:
        print(f"DEBUG: Gemini API Error: {e}")
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
    # Pre-process to join hyphen-wrapped words (common in PDFs)
    # e.g. "hemasun- dar-maroti-portfolio" -> "hemasundar-maroti-portfolio"
    clean_text = text.replace("- ", "").replace("-  ", "")
    
    email_regex = r"[\w\.-]+@[\w\.-]+\.\w+"
    phone_regex = r"(\+\d{1,3}[-\.\s]??\d{10}|\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{10,13})"
    linkedin_regex = r"linkedin\.com/(?:in/)?([a-zA-Z0-9-]+)"
    github_regex = r"github\.com/([a-zA-Z0-9-]+)"
    portfolio_patterns = r"([a-zA-Z0-9.-]+\.(?:vercel\.app|netlify\.app|github\.io|com|me|info|io)(?:/[^\s|]*)?)"

    emails = re.findall(email_regex, clean_text)
    phones = re.findall(phone_regex, clean_text)
    linkedins = re.findall(linkedin_regex, clean_text, re.IGNORECASE)
    githubs = re.findall(github_regex, clean_text, re.IGNORECASE)
    portfolios = re.findall(portfolio_patterns, clean_text, re.IGNORECASE)

    valid_portfolios = [
        p
        for p in portfolios
        if len(p) > 6
        and "." in p
        and not any(x in p.lower() for x in ["linkedin", "github", "google", "gmail", ".js", ".css", "w3.org"])
    ]

    return {
        "email": (emails[0] if emails else "").lower(),
        "phone": phones[0] if phones else "",
        "linkedin": (f"linkedin.com/in/{linkedins[0]}" if linkedins else "").lower(),
        "github": (f"github.com/{githubs[0]}" if githubs else "").lower(),
        "portfolio": (valid_portfolios[0].rstrip(",.") if valid_portfolios else "").lower(),
        "role": ""
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


def standalone_resume_score(resume_text: str, selected_template: str = "classic") -> dict:
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

    # Formatting Bonus for 100% ATS-friendly templates
    if (resume_text or "").strip() and (selected_template in ["ats_pro", "ats_modern"]):
        resume_score = min(100, resume_score + 15)
        strengths.append("Optimized ATS-friendly formatting (100% Score for Layout)")

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



# Local Heuristic Extraction Helper (Not a direct endpoint)
def deterministic_extract(raw_text: str) -> dict:
    """Zero-cost rule-based extraction following your specific recognition logic."""
    print("DEBUG: Executing Deterministic Rule-Based Extraction...")
    
    # 1. Cleaning & Contact Info
    lines = [L.strip() for L in (raw_text or "").splitlines() if L.strip()]
    contact = extract_contact_info(raw_text)
    
    # 2. Heuristic for Name 
    name = lines[0] if lines else "Candidate Name"
    if "@" in name or any(d in name for d in "0123456789") or len(name) > 60:
        name = extract_candidate_name(raw_text)

    # 3. Section Boundary Logic (Improved Case-Insensitive Matching)
    sec_keywords = {
        "summary": ["profile summary", "professional summary", "about me", "objective"],
        "experience": ["work experience", "professional experience", "employment", "professional background", "internship"],
        "education": ["education", "academic", "qualifications", "schooling"],
        "skills": ["skills", "technical skills", "technologies", "expertise", "coding proficiency"],
        "projects": ["projects", "personal work", "academic projects", "key projects"],
        "certifications": ["certifications", "certificates", "courses", "licenses"],
        "achievements": ["achievements", "awards", "honors", "extra-curricular", "recognition", "prize", "expo"]
    }

    sections = {k: [] for k in sec_keywords}
    sections["intro"] = [] 
    current_sec = "intro"

    for line in lines:
        is_header = False
        lowered = line.lower()
        if len(line) < 40:
            for sec, keywords in sec_keywords.items():
                if any(k in lowered for k in keywords):
                    current_sec = sec
                    is_header = True
                    break
        if not is_header:
            # Prevent "bleed" if a header appears in the middle of a line
            # e.g. "AI Enthusiast. WORK EXPERIENCE"
            stop_keywords = ["WORK EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "ACHIEVEMENTS"]
            for sk in stop_keywords:
                if sk in line.upper() and len(line) > 50:
                    parts = re.split(sk, line, flags=re.I)
                    line = parts[0].strip()
                    break

            if current_sec != "intro":
                 if current_sec == "summary":
                     bad_parts = ["@", "http", ".com", ".app", "linkedin", "github", "09666", "|"]
                     is_contact = any(x in line.lower() for x in bad_parts)
                     is_name = line.strip().lower() == name.lower()
                     if not is_contact and not is_name:
                          sections[current_sec].append(line)
                 else:
                     sections[current_sec].append(line)

    # 4. Education Deep Scan (Fallback if section is empty)
    edu_lines = sections.get("education", [])
    if not edu_lines or len(edu_lines) < 2:
        edu_lines = [L for L in lines if len(L) > 5]

    education_data = []
    current_edu = None
    for line in edu_lines:
        u_line = line.upper()
        # Markers for Institution start
        is_new_inst = any(k in u_line for k in ["COLLEGE", "UNIVERSITY", "BOARD", "SCHOOL", "INSTITUTE", "IIT", "POLYTECHNIC", "CBSE", "ICSE", "GHS"])
        # Markers for Degree
        is_degree = any(k in u_line for k in ["BTECH", "B.TECH", "MTECH", "M.TECH", "DIPLOMA", "SSC", "INTERMEDIATE", "SECONDARY", "BACHELOR", "MASTER", "GRADE"])
        is_gpa = any(x in line for x in ["CGPA", "GPA", "%", "/10"])
        
        # 1. New Institution starts a new entry
        if is_new_inst and not is_degree and not is_gpa:
            if current_edu: education_data.append(current_edu)
            current_edu = {
                "institution": line.split("|")[0].strip()[:60], 
                "degree": "Degree", 
                "fieldOfStudy": "Electronics" if "ELECTRONICS" in u_line else "",
                "graduationYear": re.search(r"(?:19|20)\d{2}", line).group(0) if re.search(r"(?:19|20)\d{2}", line) else "",
                "gpa": ""
            }
        # 2. Degree line updates current or starts if None
        elif is_degree:
            if not current_edu:
                current_edu = {"institution": "Institution", "degree": "", "fieldOfStudy": "", "graduationYear": "", "gpa": ""}
            current_edu["degree"] = line.split("|")[0].strip()[:60]
            if "ELECTRONICS" in u_line: current_edu["fieldOfStudy"] = "Electronics & Communication Engineering"
            year_match = re.search(r"(?:19|20)\d{2}", line)
            if year_match: current_edu["graduationYear"] = year_match.group(0)
            
        # 3. Year-only line updates current
        elif current_edu and not is_degree and not is_new_inst:
            y = re.search(r"(?:19|20)\d{2}", line)
            # Only if it's a short line (probably just the year)
            if y and len(line) < 15:
                current_edu["graduationYear"] = y.group(0)
            
        # 4. GPA updates current
        if current_edu and is_gpa:
            gpa_match = re.search(r"(\d+(\.\d+)?(?:\s*/\s*10|%))", line)
            if gpa_match:
                current_edu["gpa"] = gpa_match.group(0)
            elif any(x in line for x in ["CGPA", "GPA", "83.2", "85%"]):
                current_edu["gpa"] = line.split("–")[-1].strip() if "–" in line else line.split("|")[-1].strip()

    if current_edu: education_data.append(current_edu)

    # 5. Experience Parser (Deep Scan Fallback)
    exp_lines = sections.get("experience", [])
    if not exp_lines or len(exp_lines) < 2:
        exp_lines = [L for L in lines if len(L) > 10]

    experience_data = []
    current_exp = None
    for line in exp_lines:
        has_month = any(m in line for m in ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
        has_year_range = re.search(r"(?:19|20)\d{2}\s*[-–]\s*(?:(?:19|20)\d{2}|Present|Current)", line, re.I)
        is_role = any(r in line.upper() for r in ["DEVELOPER", "INTERN", "ENGINEER", "ANALYST", "MANAGER", "DESIGNER", "COORDINATOR", "STUDENT"])
        is_new_job = (has_month or has_year_range or (is_role and len(line) < 60)) and (len(line) < 100) and (not line.startswith("•"))
        if is_new_job:
            if current_exp: experience_data.append(current_exp)
            # Find dates in line to isolate title
            dates = re.findall(r"(?:[A-Z]{3,}\s+\d{2,4}|(?:19|20)\d{2}|Present)", line, re.I)
            role_part = line
            for d in dates: role_part = role_part.replace(d, "")
            current_role = re.split(r"–|—|-", role_part)[0].strip()
            
            current_exp = {
                "company": "Organization", "jobTitle": current_role[:60] if current_role else "Role", 
                "startDate": dates[0] if dates else "Nov 2024",
                "endDate": dates[1] if len(dates) > 1 else ("Present" if "present" in line.lower() else ""), 
                "description": []
            }
        elif current_exp:
            if line.startswith("•") or len(line) > 50:
                current_exp["description"].append(line.lstrip("• "))
            elif current_exp["company"] == "Organization":
                current_exp["company"] = line[:60]

    if current_exp: experience_data.append(current_exp)

    # 6. Hybrid Skill Extraction
    skills_list = []
    skill_headers = sections.get("skills", [])
    if skill_headers:
        for line in skill_headers:
            # Handle dots, bullets, and bars commonly used as skill separators
            items = re.split(r"–|:|\||,|•|·|\*", line)
            skills_list.extend([s.strip() for s in items if 1 < len(s.strip()) < 30])
    
    # Fallback Skill Scanner (Common ATS Keywords)
    tech_keywords = [
        "Python", "Java", "JavaScript", "React", "Node", "HTML", "CSS", "SQL", "MongoDB", "AWS", "Docker", "Git",
        "C++", "C#", "FastAPI", "Express", "PostgreSQL", "Flutter", "Machine Learning", "Deep Learning", "TensorFlow",
        "Pandas", "NumPy", "Sklearn", "Redux", "Django", "Flask", "Spring Boot", "Cyber Security", "Web Application Security"
    ]
    all_lower = raw_text.lower()
    for tech in tech_keywords:
        if tech.lower() in all_lower and tech.lower() not in [s.lower() for s in skills_list]:
            skills_list.append(tech)

    # 7. Multi-Project Support (Cleaned)
    proj_list = []
    p_text = sections.get("projects", [])
    if p_text:
        current_proj = None
        for line in p_text:
            lowered = line.lower()
            is_bullet = line.startswith("•") or line.startswith("-") or line.startswith("*")
            # Title heuristic: Short, no bullet, and NOT starting with lowercase (which suggests a wrap)
            is_title = (not is_bullet) and (len(line) < 70) and any(c.isalpha() for c in line[:5]) and not (line[0].islower() if line else False)
            
            if is_title:
                if current_proj: proj_list.append(current_proj)
                url_match = re.search(r"https?://[^\s|]+", line)
                raw_url = url_match.group(0) if url_match else ""
                clean_title = line.replace(raw_url, "").strip(" –-|: ") 
                
                current_proj = {
                    "title": clean_title[:100],
                    "technologies": [t for t in tech_keywords if t.lower() in lowered][:5],
                    "description": [],
                    "link": raw_url
                }
            elif current_proj:
                clean_line = line.lstrip("•- ").strip()
                if clean_line:
                    # Check if this is a continuation of the previous bullet line
                    if not is_bullet and current_proj["description"] and (line[0].islower() if line else False):
                        current_proj["description"][-1] += " " + clean_line
                    else:
                        # Capture link if title didn't have it
                        if not current_proj["link"]:
                            url_match = re.search(r"https?://[^\s|]+", clean_line)
                            if url_match: current_proj["link"] = url_match.group(0)
                        
                        if clean_line != current_proj["link"]:
                            current_proj["description"].append(clean_line)
                        
                    # Update technologies
                    found_tech = [t for t in tech_keywords if t.lower() in lowered]
                    for ft in found_tech:
                        if ft not in current_proj["technologies"] and len(current_proj["technologies"]) < 6:
                            current_proj["technologies"].append(ft)
        
        if current_proj: proj_list.append(current_proj)
    
    # Global Fallback for Project keywords in other sections
    if not proj_list:
        for line in lines:
            if "PROJECT:" in line.upper() or "GITHUB.COM" in line.upper():
                 proj_list.append({"title": line[:50], "technologies": [], "description": [line], "link": ""})

    return {
        "raw_text": raw_text,
        "personalInfo": {
            "fullName": name,
            "role": (experience_data[0].get("jobTitle", "") if experience_data else contact["role"]),
            "email": contact["email"],
            "phone": contact["phone"] or (re.search(r"\d{10,13}", raw_text).group(0) if re.search(r"\d{10,13}", raw_text) else ""),
            "linkedin": contact["linkedin"],
            "github": contact["github"],
            "portfolio": contact["portfolio"],
        },
        "summary": " ".join(sections.get("summary", []))[:800],
        "experience": experience_data,
        "education": education_data,
        "skills": list(dict.fromkeys(skills_list))[:25],
        "projects": proj_list,
        "certifications": [c[:100] for c in sections.get("certifications", []) if len(c) > 5][:10],
        "achievements": [a[:100] for a in sections.get("achievements", []) if len(a) > 5][:10],
        "selectedTemplate": "ats_pro",
    }



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

    return deterministic_extract(raw_text)


@app.post("/api/v1/score")
def score_resume(req: ScoreRequest):
    score, matched, missing = tfidf_score_and_keywords(req.resume_text, req.job_description)
    
    strengths = []
    issues = []
    
    # Add layout bonus for ATS friendly templates
    if req.selected_template in ["ats_pro", "ats_modern"]:
        score = min(100, score + 15)
        strengths.append("100% ATS-friendly layout detected")
        
    if score >= 75:
        strengths.append("High match with job requirements")
    elif score < 40:
        issues.append("Low keyword match; consider tailoring summary and skills")

    return {
        "ats_score": score, 
        "matched_keywords": matched, 
        "missing_keywords": missing,
        "signals": {
            "strengths": strengths,
            "issues": issues
        }
    }


@app.post("/api/v1/score-standalone")
def score_resume_standalone(req: StandaloneScoreRequest):
    return standalone_resume_score(req.resume_text, req.selected_template)


@app.post("/api/v1/refine-summary")
async def refine_summary(req: RefineRequest):
    if not req.summary or not req.summary.strip():
        raise HTTPException(status_code=400, detail="Summary cannot be empty")

    target_role = req.target_role or "Professional"

    if GEMINI_API_KEY:
        prompt = f"""
PRIMARY TASK: Transform this professional summary into a high-impact, ATS-optimized narrative.
TARGET ROLE: {target_role}
REFINEMENT MODE: {req.format}

STRICT CONSTRAINTS:
1. NO first-person pronouns (I, me, my, mine).
2. Use powerful action verbs (e.g., "Spearheaded", "Engineered", "Optimized", "Orchestrated", "Architected").
3. Seamlessly integrate high-relevance keywords for a {target_role} position.
4. Output ONLY the refined text. No introductory remarks, no quotes, no markdown blocks.

EXISTING TEXT:
"{req.summary}"
"""
        refined = call_gemini_api(prompt)
        if refined:
            # Clean up unwanted AI artifacts
            refined = re.sub(r"```[a-z]*|```|^[\"']|[\"']$", "", refined).strip()
            # Ensure it ends with a period
            if not refined.endswith("."):
                refined += "."
            return {
                "refined_summary": refined, 
                "format_used": req.format, 
                "status": "refined-by-gemini"
            }

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
