import re

def preprocess_text(text: str, max_len: int = 1000) -> str:
    if not text:
        return ""
    text = text.strip()
    # remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # normalize whitespace
    text = re.sub(r"\s+", " ", text)
    # optional lowercase (bert-base-uncased expects lowercase)
    text = text.lower()
    # truncate to max_len characters
    if len(text) > max_len:
        text = text[:max_len]
    return text

