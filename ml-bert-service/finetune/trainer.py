import os
from torch.utils.data import DataLoader
from sentence_transformers import SentenceTransformer, InputExample, losses

from .dataset_builder import build_training_triplets
from .schema import FineTuneSample

def run_finetuning(
    samples: list[FineTuneSample],
    output_dir="models/fine_tuned_sbert",
    base_model_path: str = None,
    ecf_store=None,
    feature_extractor=None
):
    # 1. Отримуємо оптимізовані трійки з Hard Negative Mining, Concept Anchoring та Stratified Rehearsal
    train_examples = build_training_triplets(
        samples=samples,
        ecf_store=ecf_store,
        feature_extractor=feature_extractor,
        include_rehearsal=True
    )

    if not train_examples:
        return {"status": "error", "message": "Немає даних для навчання"}

    # 2. Створюємо DataLoader
    batch_size = 4 if len(train_examples) >= 4 else len(train_examples)
    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)

    # 3. Завантажуємо модель для неперервного донавчання (Continual Active Learning)
    # Якщо передано base_model_path і директорія існує – стартуємо з неї, інакше з базової MiniLM
    if base_model_path and (os.path.exists(base_model_path) or not os.path.isabs(base_model_path)):
        model_name = base_model_path
    elif os.path.exists(output_dir):
        model_name = output_dir
    else:
        import config
        model_name = config.BI_ENCODER_MODEL

    print(f"[Continual Learning] Завантаження вихідної моделі: {model_name}...")
    model = SentenceTransformer(model_name)

    # 4. Визначаємо функцію втрат (Contrastive Learning - TripletLoss)
    # tripplet_margin=0.2 є оптимальним для косинусної відстані на одиничній гіперсфері,
    # запобігаючи перенавчанню та руйнуванню ортогональності вимірів e-CF.
    train_loss = losses.TripletLoss(
        model=model,
        distance_metric=losses.TripletDistanceMetric.COSINE,
        triplet_margin=0.2
    )

    # 5. Адаптивні гіперпараметри: 4-5 епох з LR=2e-5 забезпечують м'яку збіжність без дрейфу
    epochs = 4
    lr = 2e-5
    warmup_steps = max(1, int(len(train_dataloader) * 0.1))

    # 6. Запускаємо оптимізацію
    print(f"[Continual Learning] Оптимізація векторного простору ({epochs} епох, lr={lr}, {len(train_examples)} трійок)...")
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=epochs,
        warmup_steps=warmup_steps,
        optimizer_params={'lr': lr},
        output_path=output_dir,
        show_progress_bar=False
    )

    print(f"[Continual Learning] Модель успішно оновлена та збережена у {output_dir}")
    
    return {
        "status": "success",
        "saved_to": output_dir,
        "samples_processed": len(samples),
        "triplets_trained": len(train_examples),
        "epochs": epochs
    }
