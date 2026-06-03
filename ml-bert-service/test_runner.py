import requests
import json
import time
from typing import List, Dict

# --- CONFIGURATION ---
BASE_URL = "http://localhost:8000"
PREDICT_URL = f"{BASE_URL}/predict"
FINETUNE_URL = f"{BASE_URL}/finetune/train"

TEST_DATA_PATH = "test_data.json"
TRAIN_DATA_PATH = "train_data.json" # Шлях до нових навчальних даних
TOP_K = 3

def load_json_data(path: str) -> Dict:
    """Завантажує JSON дані (тестові або навчальні)."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Помилка: Файл не знайдено за шляхом {path}")
        return {}

def run_prediction(query: str, top_k: int) -> Dict:
    """Відправляє запит на прогнозування."""
    try:
        response = requests.post(PREDICT_URL, json={"text": query, "top_k": top_k})
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Помилка з'єднання з сервісом прогнозування: {e}")
        return {}

def run_finetuning(samples: List[Dict]) -> bool:
    """Відправляє запит на донавчання."""
    print("\n--- ЗАПУСК ДОНАВЧАННЯ (FINE-TUNING) ---")
    print(f"Відправляємо {len(samples)} навчальних прикладів на {FINETUNE_URL}...")
    try:
        response = requests.post(FINETUNE_URL, json={"samples": samples})
        response.raise_for_status()
        result = response.json()
        print(f"Сервер відповів: {result.get('message')}")
        if result.get("result", {}).get("status") == "success":
            print(f"Модель успішно оновлена і збережена в: {result['result']['saved_to']}")
            # Даємо серверу час на перезавантаження моделі в пам'ять
            time.sleep(2)
            return True
        else:
            print(f"Помилка під час донавчання: {result}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Помилка з'єднання з сервісом донавчання: {e}")
        return False

def calculate_metrics(test_data: List[Dict], results: List[Dict]) -> Dict:
    """Розраховує метрики Hit Rate@K та MRR@K."""
    hit_rate_at_k = 0
    reciprocal_ranks = []

    for i, item in enumerate(test_data):
        expected_ids = set(item["expected_ids"])
        predicted_ids = [res.get("competency_id") for res in results[i].get("results", [])]
        
        if expected_ids.intersection(predicted_ids):
            hit_rate_at_k += 1
        
        rank = 0
        for j, pred_id in enumerate(predicted_ids):
            if pred_id in expected_ids:
                rank = 1 / (j + 1)
                break
        reciprocal_ranks.append(rank)

    total_items = len(test_data)
    final_hit_rate = hit_rate_at_k / total_items if total_items > 0 else 0
    final_mrr = sum(reciprocal_ranks) / total_items if total_items > 0 else 0
    
    return {"hit_rate_at_k": final_hit_rate, "mrr_at_k": final_mrr}

def run_evaluation(test_data: List[Dict], phase_name: str):
    """Запускає повний цикл оцінки та виводить результати."""
    print(f"\n=== ЕТАП ОЦІНКИ: {phase_name} ===")
    
    all_results_full = []
    for i, item in enumerate(test_data):
        query = item["query"]
        full_response = run_prediction(query, TOP_K)
        all_results_full.append(full_response)

    metrics = calculate_metrics(test_data, all_results_full)
    
    print(f"\nРезультати для '{phase_name}':")
    print("------------------------------------")
    print(f"Hit Rate@{TOP_K}: {metrics['hit_rate_at_k']:.2%}")
    print(f"MRR@{TOP_K}:      {metrics['mrr_at_k']:.4f}")
    print("------------------------------------")
    return metrics

def main():
    """Головна функція для запуску тестування та донавчання."""
    test_data = load_json_data(TEST_DATA_PATH)
    if not test_data:
        return

    # 1. Оцінка базової моделі ("ДО")
    run_evaluation(test_data, "Базова модель (до донавчання)")

    # 2. Запуск донавчання
    train_data = load_json_data(TRAIN_DATA_PATH)
    if train_data and "samples" in train_data:
        if not run_finetuning(train_data["samples"]):
            print("Донавчання не вдалося. Завершення роботи.")
            return
    else:
        print("Попередження: Навчальні дані не знайдено або вони порожні. Пропускаємо донавчання.")

    # 3. Оцінка донавченої моделі ("ПІСЛЯ")
    run_evaluation(test_data, "Донавчена модель (після донавчання)")

if __name__ == "__main__":
    main()
