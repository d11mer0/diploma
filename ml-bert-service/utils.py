import numpy as np

def cosine_similarity_vec(a: np.ndarray, b: np.ndarray) -> float:
    if a is None or b is None:
        return 0.0
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)

def combine_embeddings(comp_emb: np.ndarray, level_emb: np.ndarray, alpha: float = 0.7) -> np.ndarray:
    comp = comp_emb if comp_emb is not None else np.zeros_like(level_emb)
    level = level_emb if level_emb is not None else np.zeros_like(comp_emb)
    return alpha * comp + (1.0 - alpha) * level

