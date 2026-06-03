from typing import List
from pydantic import BaseModel

# ВИДАЛЕНО: Складні моделі CompetencyModel та LevelModel більше не потрібні.

class FineTuneSample(BaseModel):
    # ВИПРАВЛЕНО: Спрощена структура, що відповідає нашому train_data.json
    query: str      # Якір (Anchor)
    positive: str   # Позитивний приклад
    negative: str   # Негативний приклад

class FineTuneRequest(BaseModel):
    # ВИДАЛЕНО: dataset_name більше не потрібне для простого донавчання.
    samples: List[FineTuneSample]
