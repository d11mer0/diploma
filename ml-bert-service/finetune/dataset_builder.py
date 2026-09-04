import json
import random
from typing import List, Tuple
from .schema import FineTuneSample

# Завантажуємо пул компетенцій e-CF для якісного підбору негативних прикладів та Rehearsal Regularization
ECF_POOL: List[str] = []
ECF_RAW_DATA: List[dict] = []
try:
    with open("ecf_data.json", "r", encoding="utf-8") as f:
        ECF_RAW_DATA = json.load(f)
        for comp in ECF_RAW_DATA:
            ECF_POOL.append(f"{comp['name']}. {comp['description']}")
except Exception as e:
    print("[dataset_builder] Помилка завантаження ecf_data.json для Negative Mining:", e)

def get_fallback_negative(positive: str) -> str:
    if not ECF_POOL:
        return "Service Management and Process Optimisation according to ITIL standards."
    candidates = [c for c in ECF_POOL if c[:20].lower() not in positive[:20].lower()]
    return random.choice(candidates) if candidates else random.choice(ECF_POOL)

def get_canonical_rehearsal_triplets(count: int = 6) -> Tuple[List[str], List[str], List[str]]:
    """
    Генерує канонічні якірні трійки (Experience Replay / Rehearsal Regularization)
    безпосередньо з опису стандарту e-CF. Це захищає векторний простір від
    катастрофічного забування (Catastrophic Forgetting) при навчанні на малих вибірках.
    """
    if not ECF_RAW_DATA or len(ECF_RAW_DATA) < 4:
        return [], [], []

    r_anchors, r_positives, r_negatives = [], [], []
    chosen_comps = random.sample(ECF_RAW_DATA, min(count, len(ECF_RAW_DATA)))

    for comp in chosen_comps:
        anchor = f"Professional IT competence: {comp['name']}. {comp['description'][:160]}"
        
        # Шукаємо валідний рівень
        valid_levels = [lvl for lvl in comp.get('levels', []) if lvl.get('description') and lvl.get('description') != '-']
        if valid_levels:
            lvl = random.choice(valid_levels)
            pos = f"{comp['name']} (Level {lvl['level']}): {lvl['description']}"
        else:
            pos = f"{comp['name']}. {comp['description']}"

        # Негативний приклад береться з зовсім іншого домену
        neg_candidates = [c for c in ECF_RAW_DATA if c.get('code', '')[:1] != comp.get('code', '')[:1]]
        if not neg_candidates:
            neg_candidates = [c for c in ECF_RAW_DATA if c.get('code') != comp.get('code')]
        neg_comp = random.choice(neg_candidates) if neg_candidates else comp
        neg = f"{neg_comp['name']}. {neg_comp['description']}"

        r_anchors.append(anchor)
        r_positives.append(pos)
        r_negatives.append(neg)

    return r_anchors, r_positives, r_negatives

def build_training_triplets(samples: List[FineTuneSample], include_rehearsal: bool = True) -> Tuple[List[str], List[str], List[str]]:
    """
    Розбиває дані від експерта на трійки (Triplets) для Contrastive Learning
    з підтримкою Negative Mining та Experience Replay Regularization.
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

    # Додаємо канонічні трійки для стабілізації простору (Rehearsal)
    if include_rehearsal and len(samples) > 0:
        rehearsal_count = max(4, min(8, len(samples) * 2))
        r_anchors, r_positives, r_negatives = get_canonical_rehearsal_triplets(rehearsal_count)
        anchors.extend(r_anchors)
        positives.extend(r_positives)
        negatives.extend(r_negatives)
        print(f"[dataset_builder] Сформовано {len(samples)} призначених зразків + {len(r_anchors)} стабілізуючих канонічних трійок (Rehearsal).")

    return anchors, positives, negatives

