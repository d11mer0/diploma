import requests
import json

URL = "http://localhost:8000/predict"

# Специфічний текст зі сленгом, який базова модель розуміє погано
payload = {
    "text": "Write unit tests with Jest, setup CI/CD pipelines, and ensure code coverage is above 90%.",
    "top_k": 5
}

print(f"Відправляємо запит на {URL}...")
try:
    resp = requests.post(URL, json=payload)
    print("Status:", resp.status_code)
    
    # Виводимо красиво, щоб легко знайти c1_semantic для B.1
    print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
except Exception as e:
    print("Помилка з'єднання:", e)