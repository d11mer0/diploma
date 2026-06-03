from typing import List, Tuple
from .schema import FineTuneSample

def build_training_triplets(samples: List[FineTuneSample]) -> Tuple[List[str], List[str], List[str]]:
    """
    Розбиває дані від експерта на трійки (Triplets) для Contrastive Learning.
    Тепер працює з простою структурою.
    """
    anchors = []
    positives = []
    negatives = []

    for s in samples:
        # ВИПРАВЛЕНО: Беремо дані з простих полів, а не зі складної структури
        anchors.append(s.query)
        positives.append(s.positive)
        negatives.append(s.negative)

    return anchors, positives, negatives
