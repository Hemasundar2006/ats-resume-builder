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

origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Added Vite default port
    "http://localhost:5000",
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
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_bytes):
    doc = Document(io.BytesIO(file_bytes))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

def clean_text(text):
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_contact_info(text):
    email_regex = r'[\w\.-]+@[\w\.-]+\.\w+'
    phone_regex = r'(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{10})'
    
    emails = re.findall(email_regex, text)
    phones = re.findall(phone_regex, text)
    
    return {
        "email": emails[0] if emails else "",
        "phone": phones[0] if phones else ""
    }

def select_template(text):
    text = text.lower()
    if any(k in text for k in ["doctor", "nurse", "medical", "hospital", "clinical", "healthcare"]):
        return "healthcare"
    if any(k in text for k in ["creative", "designer", "art", "video", "media", "graphics", "photoshop"]):
        return "creative"
    if any(k in text for k in ["sales", "account manager", "business development", "revenue", "leads"]):
        return "sales"
    if any(k in text for k in ["software", "developer", "engineer", "coder", "fullstack", "backend", "frontend"]):
        return "modern"
    if any(k in text for k in ["academic", "research", "phd", "university", "professor", "publication"]):
        return "academic"
    if any(k in text for k in ["executive", "director", "manager", "leadership", "strategy"]):
        return "executive"
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
    
    # Very basic section splitter (can be improved with better NLP)
    # This is a heuristic-based approach
    lines = text.split('\n')
    current_section = "summary"
    
    experience_keywords = ["experience", "employment", "work history", "professional background"]
    education_keywords = ["education", "academic", "qualifications"]
    skills_keywords = ["skills", "technologies", "technical stack", "tools"]
    projects_keywords = ["projects", "key projects", "personal projects"]
    awards_keywords = ["awards", "achievements", "honors"]
    certs_keywords = ["certifications", "certs", "licenses"]
    
    for line in lines:
        clean_line = line.strip().lower()
        if not clean_line: continue
        
        # Check if line is a header
        if any(k in clean_line for k in experience_keywords) and len(clean_line) < 20:
            current_section = "experience"
            continue
        elif any(k in clean_line for k in education_keywords) and len(clean_line) < 20:
            current_section = "education"
            continue
        elif any(k in clean_line for k in skills_keywords) and len(clean_line) < 20:
            current_section = "skills"
            continue
        elif any(k in clean_line for k in projects_keywords) and len(clean_line) < 20:
            current_section = "projects"
            continue
        elif any(k in clean_line for k in awards_keywords) and len(clean_line) < 20:
            current_section = "achievements"
            continue
        elif any(k in clean_line for k in certs_keywords) and len(clean_line) < 20:
            current_section = "certifications"
            continue
            
        if current_section == "summary":
            sections["summary"] += line + " "
        elif current_section == "experience":
            # Just push lines for now, frontend will need to handle formatting or we can group better
            sections["experience"].append(line)
        elif current_section == "education":
            sections["education"].append(line)
        elif current_section == "skills":
            # Split skills by comma or semicolon
            splitted = re.split(r'[,;•|]', line)
            sections["skills"].extend([s.strip() for s in splitted if s.strip()])
        elif current_section == "projects":
            sections["projects"].append(line)
        else:
            if current_section in sections:
                if isinstance(sections[current_section], list):
                    sections[current_section].append(line)
                else:
                    sections[current_section] += line + " "

    # Post-processing summary
    sections["summary"] = sections["summary"].strip()
    
    return sections

# ----------------- Step 4: Endpoints -----------------

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
    lines = raw_text.split('\n')
    name = lines[0].strip() if lines else ""
    
    # Extract sections
    sections = extract_sections(raw_text)
    
    # Template Selection
    template = select_template(raw_text)
    
    return {
        "personalInfo": {
            "fullName": name,
            "email": contact["email"],
            "phone": contact["phone"],
            "linkedin": "",
            "github": "",
            "portfolio": ""
        },
        "summary": sections["summary"][:500], # Limit summary
        "experience": [{"company": "Company Name", "jobTitle": "Job Title", "startDate": "", "endDate": "", "description": "\n".join(sections["experience"][:3])}] if sections["experience"] else [],
        "education": [{"institution": "Institution Name", "degree": "", "fieldOfStudy": "", "graduationYear": "", "gpa": ""}],
        "skills": list(set(sections["skills"]))[:15],
        "projects": [],
        "certifications": sections["certifications"][:3],
        "achievements": sections["achievements"][:3],
        "selectedTemplate": template
    }

@app.post("/api/v1/score")
def score_resume(req: ScoreRequest):
    # (Existing scoring logic remains the same)
    doc = nlp(req.resume_text)
    resume_keywords = {token.text.lower().strip() for token in doc if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and not token.is_punct}
    
    doc_jd = nlp(req.job_description)
    jd_keywords = {token.text.lower().strip() for token in doc_jd if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and not token.is_punct}
    
    if not jd_keywords:
        return {"ats_score": 0, "matched_keywords": [], "missing_keywords": []}
        
    matched_keywords = resume_keywords.intersection(jd_keywords)
    missing_keywords = jd_keywords.difference(resume_keywords)
    ats_score = round((len(matched_keywords) / len(jd_keywords)) * 100)
    
    return {
        "ats_score": ats_score,
        "matched_keywords": list(matched_keywords),
        "missing_keywords": list(missing_keywords)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
