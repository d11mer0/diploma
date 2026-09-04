import uvicorn
import json
import spacy
import time
import os
from spacy.matcher import PhraseMatcher
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional

import config
from preprocess import chunk_text, clean_text
from model import BertEmbeddingModel
from ecf_loader import ECFEmbeddingStore
from utils import cosine_similarity_vec
from finetune.schema import FineTuneRequest
from finetune.trainer import run_finetuning

print(f"Завантаження NLP-моделі spaCy: {config.SPACY_MODEL}...")
nlp = spacy.load(config.SPACY_MODEL)

print("Завантаження словників...")
def load_dict(path: str):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[УВАГА] Файл {path} не знайдено.")
        return {} if "bloom" in path else []

TECH_LIST = load_dict(config.TECH_DICT_PATH)
BLOOM_DICT = load_dict(config.BLOOM_DICT_PATH)

matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
patterns = list(nlp.pipe(TECH_LIST))
matcher.add("TECH", patterns)

app = FastAPI(title="ml-bert-service (SBERT + spaCy + Bloom)")

MODEL = BertEmbeddingModel()
ECF_STORE = ECFEmbeddingStore(
    model=MODEL, 
    ecf_json_path=config.ECF_DATA_PATH, 
    alpha=config.ECF_LOADER_ALPHA
)

class PredictRequest(BaseModel):
    text: str
    top_k: int = 5
    threshold: Optional[float] = Field(None, ge=0, le=1)

# Доменна карта прив'язки технологій та інструментів до стандартів e-CF
TECH_DOMAIN_MAP = {
    # Data Science & Artificial Intelligence
    "pytorch": ["D.7", "B.1"],
    "tensorflow": ["D.7", "B.1"],
    "scikit-learn": ["D.7", "B.1"],
    "machine learning": ["D.7", "B.1"],
    "deep learning": ["D.7", "B.1"],
    "neural networks": ["D.7", "B.1"],
    "neural network": ["D.7", "B.1"],
    "data science": ["D.7", "D.10"],
    "pandas": ["D.7", "D.10"],
    "numpy": ["D.7"],
    "nlp": ["D.7", "B.1"],
    "computer vision": ["D.7", "B.1"],

    # Database Systems & Data Management
    "sql": ["D.10", "A.5", "B.1"],
    "database": ["D.10", "A.5", "B.1"],
    "databases": ["D.10", "A.5", "B.1"],
    "relational database": ["D.10", "A.5", "B.1"],
    "postgresql": ["D.10", "A.5", "B.1"],
    "mysql": ["D.10", "A.5", "B.1"],
    "mongodb": ["D.10", "A.5", "B.1"],
    "nosql": ["D.10", "A.5", "B.1"],
    "redis": ["D.10", "A.5", "B.1"],
    "oracle": ["D.10", "A.5", "B.1"],
    "acid": ["D.10", "A.5"],

    # Cybersecurity & Information Security
    "security": ["E.8", "D.1", "C.3"],
    "cybersecurity": ["E.8", "D.1", "C.3"],
    "cryptography": ["E.8", "D.1"],
    "encryption": ["E.8", "D.1"],
    "vulnerability": ["E.8", "D.1"],
    "vulnerabilities": ["E.8", "D.1"],
    "security audit": ["E.8", "D.1"],
    "firewall": ["E.8", "C.1"],
    "iso/iec 27001": ["E.8", "D.1"],
    "iso 27001": ["E.8", "D.1"],
    "penetration testing": ["E.8", "B.3"],
    "owasp": ["E.8", "B.1"],

    # IT Project Management & Agile
    "scrum": ["E.2", "E.3"],
    "agile": ["E.2", "E.3"],
    "kanban": ["E.2", "E.3"],
    "jira": ["E.2"],
    "confluence": ["E.2", "B.5"],
    "project management": ["E.2"],
    "risk management": ["E.2", "E.8"],
    "lifecycle": ["E.2", "B.1"],

    # Software Engineering & Web
    "react": ["B.1", "A.6"],
    "angular": ["B.1", "A.6"],
    "vue": ["B.1", "A.6"],
    "node.js": ["B.1", "A.6", "A.5"],
    "express": ["B.1", "A.5"],
    "nestjs": ["B.1", "A.5"],
    "fastapi": ["B.1", "A.5"],
    "spring": ["B.1", "A.5"],
    "django": ["B.1", "A.5"],
    "rest": ["B.1", "A.5", "B.2"],
    "rest api": ["B.1", "A.5", "B.2"],
    "rest apis": ["B.1", "A.5", "B.2"],
    "api": ["B.1", "B.2", "A.5"],
    "client-server": ["A.5", "B.1"],
    "software development": ["B.1"],

    # Architecture & Design
    "architecture": ["A.5", "A.6"],
    "microservices": ["A.5", "B.1", "B.2"],
    "microservice": ["A.5", "B.1", "B.2"],
    "design patterns": ["A.5", "A.6", "B.1"],
    "design pattern": ["A.5", "A.6", "B.1"],

    # Testing & Quality Assurance
    "testing": ["B.3"],
    "unit test": ["B.3"],
    "unit tests": ["B.3"],
    "qa": ["B.3"],
    "jest": ["B.3"],
    "pytest": ["B.3"],
    "selenium": ["B.3"],

    # DevOps & Infrastructure
    "docker": ["B.4", "C.1"],
    "kubernetes": ["B.4", "C.1"],
    "ci/cd": ["B.4"],
    "aws": ["B.4", "C.1"],
    "cloud": ["B.4", "C.1", "A.5"],
    "devops": ["B.4", "C.1"],
    "linux": ["C.1", "B.4"],
    "git": ["B.1", "B.2", "B.4"]
}

def calculate_tech_relevance(found_techs: list, comp_code: str) -> float:
    if not found_techs:
        return 0.0
    exact_score = 0.0
    matched_specific = False
    for t in found_techs:
        key = t.lower().strip()
        if key in TECH_DOMAIN_MAP:
            target_codes = TECH_DOMAIN_MAP[key]
            if comp_code in target_codes:
                matched_specific = True
                if target_codes and target_codes[0] == comp_code:
                    exact_score += 1.0
                else:
                    exact_score += 0.65
    if matched_specific:
        return min(1.0, 0.60 + 0.20 * exact_score)
    if comp_code in config.TECH_COMPETENCY_CODES:
        return 0.25
    return 0.0

def process_single_text(text: str, top_k: int, threshold: Optional[float]):
    if not text or not text.strip():
        return {"results": []}

    features = extract_linguistic_features(text)
    found_techs = features["techs"]
    found_bloom_levels = features["bloom_levels"]

    # 1. Розбиваємо весь документ на смислові чанки (без обмеження у 1000 символів на весь файл!)
    chunks = chunk_text(text, chunk_size=1000, chunk_overlap=200)
    if not chunks:
        chunks = [text]

    # 2. Отримуємо ембеддінги всіх чанків батчем
    chunk_embeddings = MODEL.embed_batch(chunks)
    mappings = ECF_STORE.get_all_mappings()
    
    # 3. Max-Passage Retrieval (MaxP): для кожної компетенції шукаємо найбільш релевантний пасаж у тексті
    retrieval_candidates = []
    for m in mappings:
        best_score = -1.0
        best_chunk = chunks[0]
        for i, c_emb in enumerate(chunk_embeddings):
            score = cosine_similarity_vec(c_emb, m["combined_emb"])
            if score > best_score:
                best_score = score
                best_chunk = chunks[i]

        retrieval_candidates.append({
            "score": best_score, 
            "mapping": m, 
            "best_chunk": best_chunk
        })
    
    retrieval_candidates.sort(key=lambda x: x["score"], reverse=True)
    top_candidates = retrieval_candidates[:config.RERANK_TOP_K]

    # 4. Cross-Encoder: оцінюємо пару (знайдений конкретний пасаж силабусу + опис компетенції)
    cross_pairs = []
    for c in top_candidates:
        m = c["mapping"]
        doc_text = f"Competency: {m['competency_name']}. Description: {m['competency_description']}. Level: {m['level_description']}"
        cross_pairs.append([c["best_chunk"], doc_text])

    cross_scores = MODEL.cross_score_pairs(cross_pairs)

    final_results = []
    for i, candidate in enumerate(top_candidates):
        m = candidate["mapping"]
        c1_score = max(0.0, min(1.0, float(cross_scores[i])))
        c2_score = calculate_tech_relevance(found_techs, m["competency_code"])
        c3_score = 0.0
        if found_bloom_levels:
            dist = min(abs(m["level"] - target_lvl) for target_lvl in found_bloom_levels)
            if dist == 0:
                c3_score = 1.0
            elif dist <= config.BLOOM_ADJACENT_LEVEL_DISTANCE:
                c3_score = config.BLOOM_ADJACENT_LEVEL_SCORE

        final_score = (c1_score * config.W_SEMANTIC) + (c2_score * config.W_TECH) + (c3_score * config.W_BLOOM)

        snippet = candidate["best_chunk"]
        if len(snippet) > 250:
            snippet = snippet[:250].rsplit(' ', 1)[0] + "..."

        final_results.append({
            "competency_id": m["competency_id"],
            "competency_code": m["competency_code"],
            "competency_name": m["competency_name"],
            "competency_description": m["competency_description"],
            "level_id": m["level_id"],
            "level": m["level"],
            "level_description": m["level_description"],
            "similarity": round(final_score, 4),
            "details": {
                "c1_semantic": round(c1_score * config.W_SEMANTIC, 4),
                "c2_tech": round(c2_score * config.W_TECH, 4),
                "c3_bloom": round(c3_score * config.W_BLOOM, 4),
                "raw_cross_score": round(c1_score, 4),
                "matched_snippet": snippet
            }
        })

    final_results.sort(key=lambda x: x["similarity"], reverse=True)
    
    if threshold is not None:
        final_results = [res for res in final_results if res["similarity"] >= threshold]
    else:
        final_results = final_results[:top_k]

    return {
        "text": text[:500] + ("..." if len(text) > 500 else ""), 
        "total_chars_analyzed": len(text),
        "chunks_analyzed": len(chunks),
        "extracted_features": {
            "technologies": found_techs,
            "detected_bloom_levels": found_bloom_levels
        },
        "results": final_results
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(req: PredictRequest):
    print(f"\n[DEBUG /predict] Моделі: {MODEL.current_model_path} + Cross-Encoder")
    result = process_single_text(req.text, req.top_k, req.threshold)
    return {**result, "search_mode": "Two-Stage (Bi-Encoder + Cross-Encoder)", "top_k": req.top_k, "threshold": req.threshold}

@app.post("/finetune/train")
def finetune_model(req: FineTuneRequest):
    version_timestamp = int(time.time())
    new_model_path = f"{config.FINETUNED_MODEL_PREFIX}{version_timestamp}"
    
    result = run_finetuning(req.samples, output_dir=new_model_path)
    
    if result["status"] == "success":
        MODEL.load_finetuned(result["saved_to"])
        ECF_STORE._load_and_embed()
        
    return {
        "message": "Fine-tuning completed and model reloaded",
        "result": result
    }

# НОВИЙ ЕНДПОІНТ
@app.get("/model-info")
def get_model_info():
    model_path = MODEL.current_model_path
    last_trained_at = None

    # Якщо використовується донавчена модель, дата її створення - це час її останнього навчання
    if os.path.exists(model_path) and "fine_tuned" in model_path:
        timestamp = os.path.getctime(model_path)
        last_trained_at = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.localtime(timestamp))

    return {
        "current_model_path": model_path,
        "last_trained_at": last_trained_at
    }

def extract_linguistic_features(text: str) -> dict:
    cleaned = clean_text(text)
    # spaCy nlp ліміт за замовчуванням 1_000_000 символів; беремо до 100_000
    doc = nlp(cleaned.lower()[:100000])
    found_techs = set()
    found_levels = set()
    
    matches = matcher(doc)
    for match_id, start, end in matches:
        span = doc[start:end]
        found_techs.add(span.text)
        
    for token in doc:
        lemma_lower = token.lemma_.lower()
        text_lower = token.text.lower()
        if lemma_lower in BLOOM_DICT:
            found_levels.add(BLOOM_DICT[lemma_lower])
        elif text_lower in BLOOM_DICT:
            found_levels.add(BLOOM_DICT[text_lower])
            
    return {
        "techs": list(found_techs),
        "bloom_levels": list(found_levels)
    }

if __name__ == "__main__":
    uvicorn.run(app, host=config.HOST, port=config.PORT)
