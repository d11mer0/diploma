import requests
import json

URL = "http://localhost:8000/finetune/train"

# Формуємо ОДНУ трійку (Triplet) для Contrastive Learning
triplet_sample = {
    "profile_text": "Need a code monkey to bash out some quick frontend scripts and fix CSS bugs.",
    
    # === ПОЗИТИВ (Що ідеально підходить) ===
    "positive_competency": {
        "competency_id": 11,
        "code": "B.1",
        "name": "Application Development",
        "description": "Interprets the application design to develop a suitable application in accordance with customer needs."
    },
    "positive_level": {
        "level_id": 1101,
        "level_code": "e-2",
        "level_name": "Level 1",
        "level_description": "Acts under guidance to develop, test and document applications."
    },
    
    # === НЕГАТИВ (Від чого треба максимально відштовхнути) ===
    "negative_competency": {
        "competency_id": 37,
        "code": "E.5",
        "name": "Process Improvement",
        "description": "Measures effectiveness of existing or new ICT process approaches."
    },
    "negative_level": {
        "level_id": 3704,
        "level_code": "e-4",
        "level_name": "Level 4",
        "level_description": "Provides leadership and authorises implementation of innovations."
    }
}

# Відправляємо 4 копії (рівно 1 батч для DataLoader), більше "кувалда" не потрібна!
training_samples = [triplet_sample] * 4

payload = {
    "dataset_name": "slang_adaptation_triplet_test",
    "samples": training_samples
}

print(f"Відправляємо {len(training_samples)} трійок (Triplets) на {URL} для Contrastive Learning...")
try:
    response = requests.post(URL, json=payload)
    print("Статус код:", response.status_code)
    print("Відповідь сервера:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
except Exception as e:
    print("Помилка з'єднання:", e)