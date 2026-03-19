import re
import io
import os
import spacy
import pdfplumber
from docx import Document
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import requests
import json
import random

# Initialize environment with hybrid loading
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    name, value = line.strip().split("=", 1)
                    os.environ[name] = value

# ----------------- Step 1: spaCy Model Loading -----------------
# The local wheel file installs the model with the name "en_core_web_sm"
MODEL_NAME = os.getenv("SPACY_MODEL", "en_core_web_sm")

nlp = None
try:
    nlp = spacy.load(MODEL_NAME)
except Exception as e:
    print(f"spaCy model load failed for '{MODEL_NAME}': {e}. Falling back to regex-only.")
    MODEL_NAME = "Regex-Heuristic-Fallback"

def spacy_extract_keywords(text: str) -> set:
    if not nlp or not text:
        return set()
    doc = nlp(text[:20000])
    kws = set()
    for t in doc:
        if t.is_stop or t.is_punct or t.is_space:
            continue
        if not (t.is_alpha or t.like_num):
            continue
        lemma = (t.lemma_ or t.text).strip().lower()
        if len(lemma) > 1:
            kws.add(lemma)
    return kws

# ----------------- Step 2: FastAPI Setup -----------------
app = FastAPI(title="ATS Resume Builder - AI Service")

# Support for development and potential production origins
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "https://ats-resume-builder-neon.vercel.app", # Potential production frontend
    "*" # For fallback, or narrower during dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Step 3: Helper Functions & Models -----------------

class ScoreRequest(BaseModel):
    resume_text: str
    job_description: str

# --- Gemini AI Configuration (REST API approach for stability) ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def call_gemini_api(prompt):
    """Direct REST call to Gemini 1.5 Flash to bypass broken library installations"""
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY not found in .env")
        return None
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=20)
        response.raise_for_status()
        data = response.json()
        return data['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return None

class RefineRequest(BaseModel):
    summary: str
    target_role: Optional[str] = "Professional"
    format: Optional[str] = "balanced" # Options: balanced, impactful, concise, technical

def extract_text_from_pdf(file_bytes):
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error extracting from PDF: {e}")
        return ""

def extract_text_from_docx(file_bytes):
    try:
        doc = Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting from DOCX: {e}")
        return ""

def clean_text(text):
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_contact_info(text):
    # More permissive regex for social links
    email_regex = r'[\w\.-]+@[\w\.-]+\.\w+'
    phone_regex = r'(\+\d{1,3}[-\.\s]??\d{10}|\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{10,13})'
    linkedin_regex = r'linkedin\.com/(?:in/)?([a-zA-Z0-9-]+)'
    github_regex = r'github\.com/([a-zA-Z0-9-]+)'
    portfolio_patterns = r'(?:https?://)?([a-zA-Z0-9.-]+\.(?:vercel\.app|netlify\.app|github\.io|com|me|info|io)(?:/[^\s|]*)?)'

    # Prioritize finding the exact words to avoid junk like "eff"
    emails = re.findall(email_regex, text)
    phones = re.findall(phone_regex, text)
    linkedins = re.findall(linkedin_regex, text, re.IGNORECASE)
    githubs = re.findall(github_regex, text, re.IGNORECASE)
    portfolios = re.findall(portfolio_patterns, text, re.IGNORECASE)
    
    # Filter portfolios more strictly: must be at least 5 chars and contain a dot
    valid_portfolios = [p for p in portfolios if len(p) > 6 and '.' in p and not any(x in p.lower() for x in ['linkedin', 'github', 'google', 'gmail', '.js', '.css', 'w3.org'])]

    return {
        "email": emails[0] if emails else "",
        "phone": phones[0] if phones else "",
        "linkedin": f"linkedin.com/in/{linkedins[0]}" if linkedins else "",
        "github": f"github.com/{githubs[0]}" if githubs else "",
        "portfolio": valid_portfolios[0].rstrip(',.') if valid_portfolios else ""
    }

def select_template(text):
    # Expanded Template selection based on keyword density
    text = text.lower()
    mapping = {
        "healthcare": ["doctor", "nurse", "medical", "hospital", "clinical", "healthcare", "surgeon", "patient", "physician"],
        "creative": ["creative", "designer", "art", "video", "media", "graphics", "photoshop", "illustrator", "animation", "ui/ux"],
        "sales": ["sales", "account manager", "business development", "revenue", "leads", "marketing", "retail", "quota", "negotiation"],
        "modern": ["software", "developer", "engineer", "coder", "fullstack", "backend", "frontend", "automation", "python", "javascript", "react", "node"],
        "academic": ["academic", "research", "phd", "university", "professor", "publication", "teaching", "curriculum", "scholar"],
        "executive": ["executive", "director", "manager", "leadership", "strategy", "ceo", "cto", "vp", "president", "operations"],
        "google": ["google", "algorithm", "data structure", "faang", "distributed systems", "scalability", "cloud", "aws", "azure"],
        "consultant": ["consultant", "strategy", "mckinsey", "analysis", "framework", "optimization", "business case"],
        "ivy": ["harvard", "stanford", "yale", "princeton", "law", "finance", "investment banking", "equity"],
        "minimal": ["minimalist", "clean", "simple", "direct", "efficient"],
        "sidebar": ["sidebar", "twocolumn", "modern layout", "profile left"]
    }
    
    for template, keywords in mapping.items():
        if any(k in text for k in keywords):
            return template
            
    return "classic"

def extract_sections(text):
    sections = {
        "summary": "",
        "experience": [],
        "education": [],
        "skills": [],
        "projects": [],
        "certifications": [],
        "achievements": []
    }
    
    # Heuristic based header detection
    lines = text.split('\n')
    current_section = "summary"
    
    keywords = {
        "experience": ["experience", "employment", "work history", "professional background", "career history"],
        "education": ["education", "academic", "qualifications", "schooling"],
        "skills": ["skills", "technologies", "technical stack", "tools", "competencies", "strengths"],
        "projects": ["projects", "key projects", "personal projects", "notable works"],
        "achievements": ["awards", "achievements", "honors", "accomplishments"],
        "certifications": ["certifications", "certs", "licenses", "courses"]
    }
    
    for line in lines:
        clean_line = line.strip()
        if not clean_line: continue
        
        # Check if line looks like a header (short and contains section keywords)
        lower_line = clean_line.lower()
        found_header = False
        if len(clean_line) < 30: # Most headers are short
            for section, keys in keywords.items():
                if any(k in lower_line for k in keys):
                    current_section = section
                    found_header = True
                    break
            
        if found_header:
            continue
            
        # Append content based on current section
        if current_section == "summary":
            sections["summary"] += clean_line + " "
        elif current_section == "skills":
            # Often skills are comma-separated or bulb-points
            splitted = re.split(r'[,;•|]', clean_line)
            sections["skills"].extend([s.strip() for s in splitted if s.strip()])
        else:
            if current_section in sections:
                if isinstance(sections[current_section], list):
                    sections[current_section].append(clean_line)
                else:
                    sections[current_section] += clean_line + " "

    # Post cleanup
    sections["summary"] = sections["summary"].strip()
    return sections

# ----------------- Step 4: Endpoints -----------------

@app.get("/")
def read_root():
    return {"status": "AI service is running", "model": MODEL_NAME}

@app.post("/api/v1/extract")
async def extract_resume(file: UploadFile = File(...)):
    contents = await file.read()
    filename = file.filename.lower()
    
    if filename.endswith('.pdf'):
        raw_text = extract_text_from_pdf(contents)
    elif filename.endswith('.docx'):
        raw_text = extract_text_from_docx(contents)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")
    
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the file.")

    # Basic Extraction
    contact = extract_contact_info(raw_text)
    
    # Enhance extraction using spaCy NER if available, otherwise regex heuristic
    lines = [L for L in raw_text.split('\n') if L.strip()]
    
    # Try to find a name at the very top of the document
    name = "Candidate Name"
    if nlp:
        try:
            top_text = "\n".join(lines[:25]) if lines else raw_text[:2000]
            doc = nlp(top_text)
            person_ents = [ent.text.strip() for ent in doc.ents if ent.label_ == "PERSON" and 2 <= len(ent.text.strip()) <= 60]
            if person_ents:
                name = person_ents[0]
        except Exception as e:
            print(f"spaCy NER name extraction failed: {e}")
    if lines:
        for line in lines[:3]:
            # Simple heuristic: first line that doesn't look like contact info is usually the name
            if not any(x in line.lower() for x in ['@', 'phone', 'http', 'linkedin', 'city']):
                name = line.strip()
                break
    
    
    # Extract sections with more aggressive header matching
    def enhanced_extract_sections(text, candidate_name, contact_info):
        sections = {
            "summary": "",
            "experience": [],
            "education": [],
            "skills": [],
            "projects": [],
            "certifications": [],
            "achievements": []
        }
        
        lines = text.split('\n')
        current_section = "summary"
        
        # Comprehensive header keywords
        header_map = {
            "summary": ["summary", "objective", "profile", "about", "professional summary", "career objective"],
            "experience": ["experience", "employment", "work history", "career history", "professional background", "experience summary"],
            "education": ["education", "academic", "qualifications", "schooling", "university", "college", "academic background"],
            "skills": ["skills", "technologies", "technical stack", "tools", "competencies", "strengths", "technical skills", "languages"],
            "projects": ["projects", "key projects", "notable works", "portfolio", "academic projects", "personal projects"],
            "achievements": ["awards", "achievements", "honors", "accomplishments", "recognition", "honours"],
            "certifications": ["certifications", "certs", "licenses", "courses", "certificates", "training"]
        }
        
        contact_values = [v.lower() for v in contact_info.values() if v]
        name_lower = candidate_name.lower()

        for line in lines:
            line = line.strip()
            if not line: continue
            
            lower_line = line.lower()
            
            # Skip lines that are just the name or contact info
            if lower_line == name_lower or any(cv in lower_line for cv in contact_values):
                continue

            # More aggressive header detection
            is_header = False
            if len(line) < 45:
                # Check for direct keyword matches
                for section, keys in header_map.items():
                    if any(re.search(rf'\b{k}\b', lower_line) for k in keys):
                        current_section = section
                        is_header = True
                        break
                
                # Check for all-caps headers
                if not is_header and line.isupper() and len(line) > 3:
                    for section, keys in header_map.items():
                        if any(k in lower_line for k in keys):
                            current_section = section
                            is_header = True
                            break
            
            if is_header: continue
            
            # Map content
            if current_section == "summary":
                sections["summary"] += line + " "
            elif current_section == "skills":
                # Splitting by common delimiters
                splitted = re.split(r'[,;•|/]', line)
                sections["skills"].extend([s.strip() for s in splitted if s.strip() and len(s) < 30])
            else:
                if current_section in sections:
                    if isinstance(sections[current_section], list):
                        sections[current_section].append(line)
                    else:
                        sections[current_section] += line + " "
        
        # Fallback Skill Scanner: Look for common tech keywords anywhere if skills section is small
        tech_keywords = ["python", "javascript", "react", "node", "express", "mongodb", "java", "sql", "aws", "docker", "git", "html", "css", "c++", "c#", "typescript", "swift", "kotlin", "php", "django", "flask", "spring", "vue", "angular"]
        if len(sections["skills"]) < 5:
            found_tech = [tech for tech in tech_keywords if re.search(rf'\b{tech}\b', text.lower())]
            sections["skills"] = list(set(sections["skills"] + found_tech))

        sections["summary"] = sections["summary"].strip()
        return sections

    # --- Step 5: Advanced Gemini Extraction (AI Understanding) ---
    if GEMINI_API_KEY:
        try:
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
                # Clean markdown and parse
                json_str = re.sub(r'```[a-z]*\n|```', '', ai_data_raw).strip()
                structured_data = json.loads(json_str)
                return structured_data
        except Exception as e:
            print(f"AI Extraction failed, using heuristics: {e}")

    sections = enhanced_extract_sections(raw_text, name, contact)
    
    # Template Selection
    template = select_template(raw_text)
    
    # Map raw lines to more structured format for frontend (MATCHING MONGOOSE SCHEMA)
    def format_experience(exp_lines):
        if not exp_lines: return []
        
        date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d{2}|Present|\d{2}/\d{2}))'
        roles = []
        current_role = None
        
        # Keywords to help distinguish titles from companies
        title_keywords = ["engineer", "developer", "manager", "lead", "specialist", "intern", "analyst", "consultant", "architect"]

        for line in exp_lines:
            date_matches = re.findall(date_pattern, line)
            if date_matches and len(line) < 100:
                if current_role: roles.append(current_role)
                
                start_date = date_matches[0]
                end_date = date_matches[1] if len(date_matches) > 1 else "Present" if "Present" in line else ""
                
                # Clean line for potential title/company
                clean_line = line.replace(start_date, "").replace(end_date, "").strip(" -|")
                
                parts = re.split(r'[|,-]', clean_line)
                company = parts[0].strip().title()
                job_title = parts[1].strip().title() if len(parts) > 1 else "Professional Role"
                
                # Heuristic: if first part looks like a title, swap
                if any(tk in parts[0].lower() for tk in title_keywords):
                    job_title, company = company, job_title

                current_role = {
                    "company": company,
                    "jobTitle": job_title,
                    "startDate": start_date,
                    "endDate": end_date,
                    "description": [] 
                }
            elif not current_role:
                current_role = {"company": line.title(), "jobTitle": "Role", "startDate": "", "endDate": "", "description": []}
            else:
                if len(line) > 5:
                    current_role["description"].append(line.lstrip('•-*➢ '))
        
        if current_role: roles.append(current_role)
        return roles

    def format_education(edu_lines):
        if not edu_lines: return []
        edu_entries = []
        current_edu = None
        edu_keywords = ["university", "college", "institute", "school", "bachelor", "master", "phd", "b.tech", "m.tech", "b.sc", "m.sc", "diploma", "degree"]
        
        for line in edu_lines:
            lower_line = line.lower()
            if any(k in lower_line for k in edu_keywords) and len(line) < 100:
                if current_edu: edu_entries.append(current_edu)
                current_edu = {"institution": line.title(), "degree": "Degree", "fieldOfStudy": "", "graduationYear": "", "gpa": ""}
                for d in edu_keywords[4:]:
                    if d in lower_line:
                        current_edu["degree"] = d.upper() if len(d) <= 3 else d.title()
                        break
            elif current_edu:
                if any(c.isdigit() for c in line) and len(line) < 15:
                    current_edu["graduationYear"] = line.strip()
                else:
                    current_edu["fieldOfStudy"] += line.title() + " "
        
        if current_edu: edu_entries.append(current_edu)
        return edu_entries

    def format_projects(proj_lines):
        if not proj_lines: return []
        projects = []
        current_project = None
        
        tech_keywords = ["react", "node", "python", "mongodb", "fastapi", "express", "sql", "firebase", "aws", "docker", "flutter", "swift", "java", "html", "css", "javascript"]

        for line in proj_lines:
            line = line.strip()
            if not line: continue
            
            is_new_proj = (len(line) < 60 and (line.isupper() or any(line.startswith(c) for c in ['•', '-', '*', '➢']))) or "project" in line.lower()[:15]
            
            if is_new_proj or not current_project:
                if current_project: projects.append(current_project)
                current_project = {
                    "title": line.lstrip('•-*➢ ').replace("Project:", "").strip().title(), 
                    "technologies": [], 
                    "description": [], 
                    "link": ""
                }
                link_match = re.search(r'(https?://[^\s|]+)', line)
                if link_match:
                    current_project["link"] = link_match.group(1)
            else:
                link_match = re.search(r'(https?://[^\s|]+)', line)
                if link_match:
                    current_project["link"] = link_match.group(1)
                
                found_tech = [tech for tech in tech_keywords if re.search(rf'\b{tech}\b', line.lower())]
                current_project["technologies"].extend(found_tech)
                current_project["technologies"] = list(set(current_project["technologies"]))
                
                current_project["description"].append(line.lstrip('•-*➢ '))

        if current_project: projects.append(current_project)
        return projects

    return {
        "personalInfo": {
            "fullName": name.title(),
            "email": contact["email"].lower(),
            "phone": contact["phone"],
            "linkedin": contact["linkedin"].lower(),
            "github": contact["github"].lower(),
            "portfolio": contact["portfolio"].lower()
        },
        "summary": sections["summary"][:1000],
        "experience": format_experience(sections["experience"]),
        "education": format_education(sections["education"]),
        "skills": [s.title() if len(s) > 3 else s.upper() for s in sections["skills"]],
        "projects": format_projects(sections["projects"]),
        "certifications": [c.title() for c in sections["certifications"]],
        "achievements": [a.title() for a in sections["achievements"]],
        "selectedTemplate": template
    }

@app.post("/api/v1/score")
def score_resume(req: ScoreRequest):
    # ATS Scoring via keyword overlap.
    # Prefer spaCy (lemmatized tokens) if available; otherwise use regex fallback.
    stopwords = {'the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'was', 'were'}

    resume_keywords = spacy_extract_keywords(req.resume_text)
    jd_keywords = spacy_extract_keywords(req.job_description)

    if not resume_keywords or not jd_keywords:
        resume_keywords = set(re.findall(r'\b[a-z][a-z0-9+#.]{1,}\b', (req.resume_text or "").lower()))
        jd_keywords = set(re.findall(r'\b[a-z][a-z0-9+#.]{1,}\b', (req.job_description or "").lower()))
        resume_keywords = {k for k in resume_keywords if k not in stopwords and len(k) > 1}
        jd_keywords = {k for k in jd_keywords if k not in stopwords and len(k) > 1}
    
    if not jd_keywords:
        return {"ats_score": 0, "matched_keywords": [], "missing_keywords": []}
        
    matched_keywords = resume_keywords.intersection(jd_keywords)
    missing_keywords = jd_keywords.difference(resume_keywords)
    # Basic matching percentage
    ats_score = round((len(matched_keywords) / len(jd_keywords)) * 100) if jd_keywords else 0
    
    return {
        "ats_score": ats_score,
        "matched_keywords": list(matched_keywords),
        "missing_keywords": list(missing_keywords)
    }

@app.post("/api/v1/refine-summary")
async def refine_summary(req: RefineRequest):
    if not req.summary.strip():
        raise HTTPException(status_code=400, detail="Summary cannot be empty")
    
    target_role = req.target_role or "Professional"
    
    # 1. OPTION A: If Gemini API Key exists, use it for best results
    if GEMINI_API_KEY:
        try:
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
            
            refined_text = call_gemini_api(prompt)
            if refined_text:
                refined_text = re.sub(r'```[a-z]*|```|^["\']|["\']$', '', refined_text).strip()
                return {"refined_summary": refined_text, "format_used": req.format, "status": "refined-by-gemini"}
        except Exception as e:
            print(f"Gemini Refine Error: {e}. Falling back.")
    
    # 2. OPTION B: Fallback to local rule-based refinement (Regex instead of spaCy)
    # No spaCy installed, so we use simpler word replacement
    
    # Expanded Action Verb Dictionary (ATS Power Words)
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
        "reduced": "Mitigated"
    }

    refined_text = req.summary
    for old, new in ats_verbs.items():
        # Match word boundaries to avoid replacing parts of words
        refined_text = re.sub(rf'\b{old}\b', new, refined_text, flags=re.IGNORECASE)
    
    # Structural Formatting based on Mode
    if req.format == "concise":
        refined_text = re.sub(r'^(?i)(highly motivated|result-driven|possessing)\s+\w+\s+', "", refined_text)
        if len(refined_text) > 300:
            refined_text = refined_text[:300] + "..."
    elif req.format == "technical":
        if "specializing in" not in refined_text.lower():
            refined_text = f"{target_role} with expertise in " + refined_text[0].lower() + refined_text[1:]
    else: # balanced / impactful
        refined_text = re.sub(r'^(?i)i am a\s+', f"Highly motivated {target_role} with ", refined_text)
        refined_text = re.sub(r'^(?i)i have\s+', "Possessing ", refined_text)
        
    if refined_text:
        refined_text = refined_text[0].upper() + refined_text[1:]
        if not refined_text.endswith('.'):
            refined_text += '.'

    return {
        "refined_summary": refined_text, 
        "format_used": req.format,
        "status": "refined-locally-fallback"
    }

if __name__ == "__main__":
    import uvicorn
    # Make sure to run with host 0.0.0.0 for docker/render compatibility
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
