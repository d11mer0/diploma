import os
from torch.utils.data import DataLoader
from sentence_transformers import SentenceTransformer, InputExample, losses

from .dataset_builder import build_training_triplets
from .schema import FineTuneSample

def run_finetuning(samples: list[FineTuneSample], output_dir="models/fine_tuned_sbert"):
    # 1. Отримуємо розбиті дані з нашого оновленого dataset_builder
    anchors, positives, negatives = build_training_triplets(samples)

    # 2. Формуємо список InputExample для SBERT
    train_examples = []
    for anchor, positive, negative in zip(anchors, positives, negatives):
        # Для TripletLoss ми передаємо 3 тексти: Якір, Позитив, Негатив.
        train_examples.append(InputExample(texts=[anchor, positive, negative]))

    if not train_examples:
        return {"status": "error", "message": "Немає даних для навчання"}

    # 3. Створюємо DataLoader
    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=4)

    # 4. Завантажуємо модель
    # Тепер модель буде завантажуватися з config.py, який ми щойно відкотили
    model_name = output_dir if os.path.exists(output_dir) else "all-MiniLM-L6-v2" # Повертаємося до MiniLM
    print(f"Завантаження моделі для донавчання: {model_name}...")
    model = SentenceTransformer(model_name)

    # 5. Визначаємо функцію втрат (Contrastive Learning - TripletLoss)
    train_loss = losses.TripletLoss(
        model=model,
        distance_metric=losses.TripletDistanceMetric.COSINE,
        triplet_margin=0.5
    )

    # 6. Запускаємо цикл тренування
    print("Тренування векторного простору (Contrastive Learning)...")
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=4,  # Повертаємо 4 епохи
        warmup_steps=int(len(train_dataloader) * 0.1),
        output_path=output_dir,
        show_progress_bar=True
        # optimizer_params={'lr': 1e-6} - видаляємо, повертаємо стандартний LR
    )

    print(f"Модель успішно збережена у {output_dir}")
    
    return {
        "status": "success",
        "saved_to": output_dir,
        "samples_processed": len(samples)
    }
