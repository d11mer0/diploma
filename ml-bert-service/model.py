import os
import glob
import numpy as np
from sentence_transformers import SentenceTransformer, CrossEncoder
from preprocess import preprocess_text
import config  # Імпортуємо наш новий файл конфігурації

class BertEmbeddingModel:
    def __init__(self, device: str = None):
        # === 1. ІНІЦІАЛІЗАЦІЯ BI-ENCODER ===
        # Використовуємо шляхи та імена моделей з config.py
        finetuned_folders = glob.glob(config.FINETUNED_MODEL_GLOB)
        
        if finetuned_folders:
            latest_model_path = max(finetuned_folders, key=os.path.getctime)
            print(f"[INFO] Завантаження останньої версії Bi-Encoder: {latest_model_path}")
            self.current_model_path = latest_model_path
        else:
            print(f"[INFO] Довчених моделей не знайдено. Завантаження базової Bi-Encoder: {config.BI_ENCODER_MODEL}")
            self.current_model_path = config.BI_ENCODER_MODEL
            
        self.model = SentenceTransformer(self.current_model_path, device=device)
        
        # === 2. ІНІЦІАЛІЗАЦІЯ CROSS-ENCODER (STSB) ===
        print(f"[INFO] Завантаження Cross-Encoder для ре-ранкінгу: {config.CROSS_ENCODER_MODEL}")
        self.cross_encoder = CrossEncoder(config.CROSS_ENCODER_MODEL, device=device)

    def embed(self, text: str) -> np.ndarray:
        text = preprocess_text(text)
        return self.model.encode(text)

    def embed_batch(self, texts: list[str]) -> np.ndarray:
        processed = [preprocess_text(t) for t in texts]
        return self.model.encode(processed)
    
    def cross_score(self, query: str, documents: list[str]) -> list[float]:
        """
        Cross-Encoder: Читає запит та документи ОДНОЧАСНО.
        Модель STSB нативно повертає значення від 0.0 до 1.0.
        """
        if not documents:
            return []
            
        pairs = [[query, doc] for doc in documents]
        
        # Отримуємо готові відсотки
        scores = self.cross_encoder.predict(pairs)
        
        if isinstance(scores, float) or scores.ndim == 0:
            scores = [scores]
            
        return [float(score) for score in scores]

    def load_finetuned(self, path: str):
        if os.path.exists(path):
            print(f"[SUCCESS] Оновлення Bi-Encoder на версію з: {path}")
            self.model = SentenceTransformer(path)
            self.current_model_path = path
            return True
        return False
