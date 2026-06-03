"""
Централізований файл конфігурації для ml-bert-service.
"""
from typing import List

# --- PATHS ---
SPACY_MODEL: str = "en_core_web_sm"
TECH_DICT_PATH: str = "tech_dict.json"
BLOOM_DICT_PATH: str = "bloom_dict.json"
ECF_DATA_PATH: str = "ecf_data.json"
FINETUNED_MODEL_GLOB: str = "models/fine_tuned_sbert_v*"
FINETUNED_MODEL_PREFIX: str = "models/fine_tuned_sbert_v"

# --- MODELS ---
# ПОВЕРТАЄМОСЯ до легшої та більш стабільної для нашої задачі моделі
BI_ENCODER_MODEL: str = "all-MiniLM-L6-v2"
CROSS_ENCODER_MODEL: str = "cross-encoder/stsb-distilroberta-base"

# --- SCORING ---
W_SEMANTIC: float = 0.75
W_TECH: float = 0.15
W_BLOOM: float = 0.10
RERANK_TOP_K: int = 15
BLOOM_ADJACENT_LEVEL_SCORE: float = 0.5
BLOOM_ADJACENT_LEVEL_DISTANCE: int = 1
TECH_COMPETENCY_CODES: List[str] = [
    "B.1", "B.2", "B.3", "B.4", "B.5", "B.6",
    "A.5", "A.6", "C.1", "C.2", "C.3", "C.4"
]
ECF_LOADER_ALPHA: float = 0.7

# --- SERVER ---
HOST: str = "0.0.0.0"
PORT: int = 8000
