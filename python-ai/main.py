import os
import re
import io
import spacy
import pdfplumber
from docx import Document
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# ----------------- Step 1: spaCy Model Loading -----------------
MODEL_NAME = "en_core_web_sm"

try:
    nlp = spacy.load(MODEL_NAME)
except OSError:
    print(f"Downloading spaCy model '{MODEL_NAME}'...")
    from spacy.cli import download
    download(MODEL_NAME)
    nlp = spacy.load(MODEL_NAME)

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
    # Simple regex for email and phone numbers
    email_regex = r'[\w\.-]+@[\w\.-]+\.\w+'
    phone_regex = r'(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{10,13})'
    
    emails = re.findall(email_regex, text)
    phones = re.findall(phone_regex, text)
    
    return {
        "email": emails[0] if emails else "",
        "phone": phones[0] if phones else ""
    }

def select_template(text):
    # Template selection based on keyword density/presence
    text = text.lower()
    mapping = {
        "healthcare": ["doctor", "nurse", "medical", "hospital", "clinical", "healthcare", "surgeon"],
        "creative": ["creative", "designer", "art", "video", "media", "graphics", "photoshop", "illustrator", "animation"],
        "sales": ["sales", "account manager", "business development", "revenue", "leads", "marketing", "retail"],
        "modern": ["software", "developer", "engineer", "coder", "fullstack", "backend", "frontend", "automation", "python", "javascript", "react", "node"],
        "academic": ["academic", "research", "phd", "university", "professor", "publication", "teaching", "curriculum"],
        "executive": ["executive", "director", "manager", "leadership", "strategy", "ceo", "cto", "vp", "president"]
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
    
    # Try to find Name (often first line)
    lines = [L for L in raw_text.split('\n') if L.strip()]
    name = lines[0].strip() if lines else "Candidate Name"
    
    # Extract sections
    sections = extract_sections(raw_text)
    
    # Template Selection
    template = select_template(raw_text)
    
    # Map raw lines to more structured format for frontend (Keep compatible with existing UI)
    def format_experience(exp_lines):
        if not exp_lines: return []
        # Return first 3 descriptive lines of experience
        return [{
            "company": "Company Name", 
            "jobTitle": "Job Title", 
            "startDate": "", 
            "endDate": "", 
            "description": "\n".join(exp_lines[:4])
        }]

    return {
        "personalInfo": {
            "fullName": name,
            "email": contact["email"],
            "phone": contact["phone"],
            "linkedin": "",
            "github": "",
            "portfolio": ""
        },
        "summary": sections["summary"][:600],
        "experience": format_experience(sections["experience"]),
        "education": [{"institution": "Institution Name", "degree": "", "fieldOfStudy": "", "graduationYear": "", "gpa": ""}],
        "skills": list(set(sections["skills"]))[:20], # More skills allowed
        "projects": [],
        "certifications": sections["certifications"][:5],
        "achievements": sections["achievements"][:5],
        "selectedTemplate": template
    }

@app.post("/api/v1/score")
def score_resume(req: ScoreRequest):
    # ATS Scoring via NLP keyword matching
    doc = nlp(req.resume_text)
    # Extract nouns and proper nouns as keywords
    resume_keywords = {
        token.text.lower().strip() 
        for token in doc 
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and not token.is_punct
    }
    
    doc_jd = nlp(req.job_description)
    jd_keywords = {
        token.text.lower().strip() 
        for token in doc_jd 
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and not token.is_punct
    }
    
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

if __name__ == "__main__":
    import uvicorn
    # Make sure to run with host 0.0.0.0 for docker/render compatibility
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
