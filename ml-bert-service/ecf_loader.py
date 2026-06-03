import json
from sentence_transformers import util
import torch

class ECFEmbeddingStore:
    def __init__(self, model, ecf_json_path, alpha=0.5):
        self.model = model
        self.ecf_json_path = ecf_json_path
        self.alpha = alpha
        self._load_and_embed()

    def _load_and_embed(self):
        print("Завантаження та ембеддінг компетенцій e-CF...")
        with open(self.ecf_json_path, 'r', encoding='utf-8') as f:
            competences = json.load(f)

        self.mappings = []
        for comp in competences:
            for level_info in comp['levels']:
                if level_info['description'] == '-':
                    continue

                # Створюємо унікальний ID для кожного рівня компетенції
                mapping_id = f"{comp['code']}-{level_info['level']}"
                
                # Комбінуємо описи для кращого ембеддінгу
                combined_text = f"{comp['name']}. {comp['description']} {level_info['description']}"
                
                self.mappings.append({
                    "competency_id": mapping_id, # Використовуємо наш унікальний ID
                    "competency_code": comp['code'],
                    "competency_name": comp['name'],
                    "competency_description": comp['description'],
                    "level_id": level_info['level_id'],
                    "level": level_info['level'],
                    "level_description": level_info['description'],
                    "combined_text": combined_text,
                })

        # ВИПРАВЛЕНО: Використовуємо embed_batch без show_progress_bar
        all_texts = [m['combined_text'] for m in self.mappings]
        embeddings = self.model.embed_batch(all_texts)

        for i, m in enumerate(self.mappings):
            m['combined_emb'] = embeddings[i]

        print(f"Успішно завантажено та оброблено {len(self.mappings)} рівнів компетенцій.")

    def get_all_mappings(self):
        return self.mappings

    def find_closest(self, query_emb, top_k=5):
        scores = []
        for m in self.mappings:
            # util.pytorch_cos_sim очікує тензори, тому перетворюємо numpy array на тензор
            query_tensor = torch.tensor(query_emb)
            doc_tensor = torch.tensor(m['combined_emb'])
            score = util.pytorch_cos_sim(query_tensor, doc_tensor)[0][0].item()
            scores.append({'score': score, 'mapping': m})
        
        scores.sort(key=lambda x: x['score'], reverse=True)
        return scores[:top_k]
