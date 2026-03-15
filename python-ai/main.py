import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy

# ----------------- Step 1: spaCy Model Loading -----------------
# We attempt to load the 'en_core_web_sm' model. 
# If it fails, we download it using the spacy cli directly within the script.
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

# Configure CORS for Node server (5000) and React app (3000)
origins = [
    "http://localhost:3000",
    "http://localhost:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Step 3: Models & Endpoint -----------------
class ScoreRequest(BaseModel):
    resume_text: str
    job_description: str

def extract_keywords(text: str) -> set:
    """
    Extract technical skills, keywords, and proper nouns using spaCy.
    We filter for NOUN and PROPN, ignoring stop words and punctuation.
    """
    doc = nlp(text)
    keywords = set()
    for token in doc:
        # We look for Nouns (general keywords) and Proper Nouns (which often include specific tech stacks)
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and not token.is_punct:
            # We standardize by converting everything to lowercase to improve matching
            keywords.add(token.text.lower().strip())
    
    # Remove any empty strings from the result
    keywords.discard("")
    return keywords

@app.post("/api/v1/score")
def score_resume(req: ScoreRequest):
    # Extract keyword sets from the text
    resume_keywords = extract_keywords(req.resume_text)
    jd_keywords = extract_keywords(req.job_description)
    
    # If Job Description has no keywords, we cannot effectively score it
    if not jd_keywords:
        return {
            "ats_score": 0,
            "matched_keywords": [],
            "missing_keywords": []
        }
        
    # Calculate matches and misses relative to the job description keywords
    matched_keywords = resume_keywords.intersection(jd_keywords)
    missing_keywords = jd_keywords.difference(resume_keywords)
    
    # Calculate ATS score percentage based on matching job description keywords
    ats_score = round((len(matched_keywords) / len(jd_keywords)) * 100)
    
    # Return exactly standard JSON structure
    return {
        "ats_score": ats_score,
        "matched_keywords": list(matched_keywords),
        "missing_keywords": list(missing_keywords)
    }

if __name__ == "__main__":
    import uvicorn
    # Make sure to run the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
