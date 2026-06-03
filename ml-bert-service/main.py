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

def process_single_text(text: str, top_k: int, threshold: Optional[float]):
    if not text or not text.strip():
        return {"results": []}

    features = extract_linguistic_features(text)
    found_techs = features["techs"]
    found_bloom_levels = features["bloom_levels"]

    query_emb = MODEL.embed(text)
    mappings = ECF_STORE.get_all_mappings()
    
    retrieval_candidates = []
    for m in mappings:
        score = cosine_similarity_vec(query_emb, m["combined_emb"])
        retrieval_candidates.append({"score": score, "mapping": m})
    
    retrieval_candidates.sort(key=lambda x: x["score"], reverse=True)
    top_candidates = retrieval_candidates[:config.RERANK_TOP_K]

    doc_texts = [
        f"Competency: {c['mapping']['competency_name']}. Description: {c['mapping']['competency_description']}. Level: {c['mapping']['level_description']}"
        for c in top_candidates
    ]
    cross_scores = MODEL.cross_score(text, doc_texts)

    final_results = []
    for i, candidate in enumerate(top_candidates):
        m = candidate["mapping"]
        c1_score = cross_scores[i]
        c2_score = 1.0 if found_techs and m["competency_code"] in config.TECH_COMPETENCY_CODES else 0.0
        c3_score = 0.0
        if found_bloom_levels:
            dist = min(abs(m["level"] - target_lvl) for target_lvl in found_bloom_levels)
            if dist == 0:
                c3_score = 1.0
            elif dist <= config.BLOOM_ADJACENT_LEVEL_DISTANCE:
                c3_score = config.BLOOM_ADJACENT_LEVEL_SCORE

        final_score = (c1_score * config.W_SEMANTIC) + (c2_score * config.W_TECH) + (c3_score * config.W_BLOOM)

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
                "raw_cross_score": round(c1_score, 4)
            }
        })

    final_results.sort(key=lambda x: x["similarity"], reverse=True)
    
    if threshold is not None:
        final_results = [res for res in final_results if res["similarity"] >= threshold]
    else:
        final_results = final_results[:top_k]

    return {
        "text": text, 
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
    doc = nlp(text.lower())
    found_techs = set()
    found_levels = set()
    
    matches = matcher(doc)
    for match_id, start, end in matches:
        span = doc[start:end]
        found_techs.add(span.text)
        
    for token in doc:
        lemma_lower = token.lemma_.lower()
        if lemma_lower in BLOOM_DICT:
            found_levels.add(BLOOM_DICT[lemma_lower])
            
    return {
        "techs": list(found_techs),
        "bloom_levels": list(found_levels)
    }

if __name__ == "__main__":
    uvicorn.run(app, host=config.HOST, port=config.PORT)
