import re
from typing import List

def clean_text(text: str) -> str:
    """Очищення тексту від HTML, зайвих пробілів та спецсимволів."""
    if not text:
        return ""
    text = text.strip()
    # Видаляємо HTML-теги
    text = re.sub(r"<[^>]+>", " ", text)
    # Нормалізуємо табуляції та горизонтальні пробіли
    text = re.sub(r"[ \t]+", " ", text)
    # Нормалізуємо множинні переноси рядків (не більше двох)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()

def preprocess_text(text: str, max_len: int = 1000) -> str:
    """Очищення та нормалізація короткого тексту або окремого чанка."""
    cleaned = clean_text(text)
    if not cleaned:
        return ""
    cleaned = re.sub(r"\s+", " ", cleaned).lower()
    if max_len and len(cleaned) > max_len:
        cleaned = cleaned[:max_len]
    return cleaned

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """
    Розбиває довгий текст силабусу на смислові чанки (пасажі) з перекриттям.
    Це дозволяє моделям Sentence-Transformers та Cross-Encoder аналізувати весь документ
    будь-якого обсягу без втрати важливих розділів (лекцій, лабораторних, ПРН).
    """
    cleaned = clean_text(text)
    if not cleaned:
        return []

    # Якщо текст менший або дорівнює розміру одного чанка, повертаємо його повністю
    if len(cleaned) <= chunk_size:
        return [cleaned]

    # Спроба розбити на логічні абзаци
    paragraphs = [p.strip() for p in re.split(r'\n+', cleaned) if p.strip()]

    # Якщо абзаців мало (суцільний текст), розбиваємо за реченнями
    if len(paragraphs) <= 1:
        paragraphs = [s.strip() for s in re.split(r'(?<=[.!?])\s+', cleaned) if s.strip()]

    chunks = []
    current_chunk = ""

    for p in paragraphs:
        if not current_chunk:
            current_chunk = p
        elif len(current_chunk) + len(p) + 1 <= chunk_size:
            current_chunk += " " + p
        else:
            chunks.append(current_chunk)
            # Перекриття: зберігаємо кінець попереднього чанка
            if chunk_overlap > 0 and len(current_chunk) > chunk_overlap:
                overlap_text = current_chunk[-chunk_overlap:]
                space_idx = overlap_text.find(" ")
                if space_idx != -1:
                    overlap_text = overlap_text[space_idx + 1:]
                current_chunk = overlap_text + " " + p if overlap_text else p
            else:
                current_chunk = p

    if current_chunk:
        chunks.append(current_chunk)

    # Страховка для надто довгих нерозривних блоків
    final_chunks = []
    for c in chunks:
        if len(c) > chunk_size * 1.4:
            step = chunk_size - chunk_overlap
            for i in range(0, len(c), step):
                sub = c[i:i + chunk_size].strip()
                if sub:
                    final_chunks.append(sub)
        else:
            final_chunks.append(c)

    return final_chunks if final_chunks else [cleaned]


