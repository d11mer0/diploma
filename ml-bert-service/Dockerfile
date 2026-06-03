# ML Сервіс (Python, FastAPI, PyTorch)
# Використовуємо офіційний Python образ
FROM python:3.10-slim

WORKDIR /app

# Встановлюємо системні залежності, необхідні для компіляції деяких Python пакетів
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Копіюємо файл залежностей
COPY requirements.txt .

# Встановлюємо Python залежності (без кешування для зменшення розміру образу)
RUN pip install --no-cache-dir -r requirements.txt

# Встановлюємо spaCy модель (українська або багатомовна залежно від вашого налаштування, зараз en_core_web_sm як дефолт)
# Переконайтеся, що ця назва збігається з тою, що в config.py
RUN python -m spacy download en_core_web_sm

# Завантажуємо SentenceTransformers моделі на етапі збірки образу!
# Це збільшить час створення образу, але сервіс запускатиметься миттєво
# Додаємо скрипт для попереднього завантаження моделей
RUN echo "from sentence_transformers import SentenceTransformer, CrossEncoder\n\
SentenceTransformer('all-MiniLM-L6-v2')\n\
CrossEncoder('cross-encoder/stsb-distilroberta-base')\n" > predownload.py
RUN python predownload.py

# Копіюємо весь код
COPY . .

EXPOSE 8000

# Запускаємо FastAPI через Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
