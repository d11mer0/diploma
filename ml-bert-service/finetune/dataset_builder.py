import json
import random
from typing import List, Tuple
from .schema import FineTuneSample

# Завантажуємо пул компетенцій e-CF для якісного підбору негативних прикладів (Negative Mining)
ECF_POOL: List[str] = []
try:
    with open("ecf_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        for comp in data:
            ECF_POOL.append(f"{comp['name']}. {comp['description']}")
except Exception as e:
    print("[dataset_builder] Помилка завантаження ecf_data.json для Negative Mining:", e)

def get_fallback_negative(positive: str) -> str:
    if not ECF_POOL:
        return "Service Management and Process Optimisation according to ITIL standards."
    candidates = [c for c in ECF_POOL if c[:20].lower() not in positive[:20].lower()]
    return random.choice(candidates) if candidates else random.choice(ECF_POOL)

def build_training_triplets(samples: List[FineTuneSample]) -> Tuple[List[str], List[str], List[str]]:
    """
    Розбиває дані від експерта на трійки (Triplets) для Contrastive Learning
    з підтримкою автоматичного вилучення справжніх негативних прикладів (Negative Mining).
    """
    anchors = []
    positives = []
    negatives = []

    for s in samples:
        neg = s.negative.strip() if s.negative else ""
        # Якщо негативний приклад порожній, є заглушкою або надто коротким – підбираємо справжню компетенцію
        if not neg or "other it competence" in neg.lower() or len(neg) < 15:
            neg = get_fallback_negative(s.positive)

        anchors.append(s.query)
        positives.append(s.positive)
        negatives.append(neg)

    return anchors, positives, negatives
