import json
import random
from typing import List, Tuple
from sentence_transformers import InputExample
from .schema import FineTuneSample

ECF_POOL: List[str] = []
ECF_RAW_DATA: List[dict] = []
try:
    with open("ecf_data.json", "r", encoding="utf-8") as f:
        ECF_RAW_DATA = json.load(f)
        for comp in ECF_RAW_DATA:
            ECF_POOL.append(f"{comp['name']}. {comp['description']}")
except Exception as e:
    print("[dataset_builder] Помилка завантаження ecf_data.json для Negative Mining:", e)

def mine_hard_negatives_from_store(query_text: str, positive_text: str, ecf_store, top_k: int = 2) -> List[str]:
    """
    Автоматично знаходить найближчих хибнопозитивних конкурентів (Hard Negatives)
    з поточного векторного простору моделі для загострення розділової гіперповерхні.
    """
    if ecf_store is not None and hasattr(ecf_store, 'find_closest'):
        try:
            q_emb = ecf_store.model.embed(query_text)
            closest = ecf_store.find_closest(q_emb, top_k=20)
            
            pos_lower = positive_text.lower()
            hard_negs = []
            seen_codes = set()
            
            for item in closest:
                m = item['mapping']
                comp_code = m['competency_code']
                comp_name = m['competency_name'].lower()
                
                # Пропускаємо, якщо це цільова компетенція
                if comp_code.lower() in pos_lower or comp_name[:15] in pos_lower:
                    continue
                if comp_code in seen_codes:
                    continue
                    
                seen_codes.add(comp_code)
                hard_negs.append(m['combined_text'])
                if len(hard_negs) >= top_k:
                    break
                    
            if hard_negs:
                return hard_negs
        except Exception as e:
            print("[dataset_builder] Помилка hard negative mining через ecf_store:", e)

    # Fallback на семантичний пул
    candidates = [c for c in ECF_POOL if c[:20].lower() not in positive_text[:20].lower()]
    return random.sample(candidates, min(top_k, len(candidates))) if candidates else [positive_text]

def get_stratified_rehearsal_triplets() -> List[InputExample]:
    """
    Генерує збалансовані двомовні канонічні стабілізуючі трійки для всіх 5 вимірів e-CF (A, B, C, D, E).
    Вони діють як взаємні ортогональні просторові координатні якорі, запобігаючи домінуванню
    окремої категорії (наприклад, B.1 чи C.1) та захищаючи від катастрофічного забування.
    """
    canonical_samples = [
        # Dimension A: Architecture / Plan -> Neg: C (Operations)
        ("IT enterprise architecture, system component specifications, microservices patterns, software modeling [Domain technologies: architecture, microservices, design patterns]",
         "Architecture Design. Specifies and designs technical architecture and systems solutions.",
         "Systems Management. Administers, configures and optimizes computer networks, operating systems and system hardware."),
        ("Архітектура програмних систем, проектування компонентів, мікросервісна архітектура та шаблони проектування [Domain technologies: microservices, design patterns]",
         "Architecture Design. Specifies and designs technical architecture and systems solutions.",
         "Systems Management. Administers, configures and optimizes computer networks, operating systems and system hardware."),

        # Dimension B: Development / Build -> Neg: E (Security)
        ("Software application programming, backend API implementation, web application development [Domain technologies: python, java, javascript, rest api]",
         "Application Development. Interprets the application design to develop and write reliable software code.",
         "Information Security Management. Implements security policy and monitors cyber threats and vulnerabilities."),
        ("Розробка програмного забезпечення, створення веб-додатків, програмування серверних та клієнтських компонентів [Domain technologies: java, python, javascript]",
         "Application Development. Interprets the application design to develop and write reliable software code.",
         "Information Security Management. Implements security policy and monitors cyber threats and vulnerabilities."),

        # Dimension C: Cloud & Operations / Run -> Neg: D (Data Science)
        ("Production cloud operations, service delivery, kubernetes container orchestration, infrastructure monitoring [Domain technologies: cloud, kubernetes, docker, ci/cd]",
         "Service Delivery. Ensures that service delivery meets agreed quality, availability and security levels.",
         "Data Science and Analytics. Applies machine learning and statistical methods to extract knowledge from complex data."),
        ("Хмарні обчислення, хмарні технології, віртуалізація, адміністрування та моніторинг хмарної інфраструктури [Domain technologies: cloud, kubernetes, aws, azure]",
         "Service Delivery. Ensures that service delivery meets agreed quality, availability and security levels.",
         "Data Science and Analytics. Applies machine learning and statistical methods to extract knowledge from complex data."),

        # Dimension D: Data Science & AI / Enable -> Neg: A (Architecture)
        ("Machine learning models, neural networks, statistical analytics, big data science [Domain technologies: machine learning, data science, python]",
         "Data Science and Analytics. Applies machine learning and statistical methods to extract knowledge from complex data.",
         "Architecture Design. Specifies and designs technical architecture and systems solutions."),
        ("Штучний інтелект, машинне навчання, глибоке навчання, нейронні мережі та аналіз даних [Domain technologies: машинне навчання, штучний інтелект, python]",
         "Data Science and Analytics. Applies machine learning and statistical methods to extract knowledge from complex data.",
         "Architecture Design. Specifies and designs technical architecture and systems solutions."),

        # Dimension E: Cybersecurity & Governance / Manage -> Neg: B (Development)
        ("Cybersecurity defense, cryptography algorithms, penetration testing, security audit and threat monitoring [Domain technologies: кібербезпека, cryptography, security audit]",
         "Information Security Management. Implements security policy and monitors cyber threats and vulnerabilities.",
         "Application Development. Interprets the application design to develop and write reliable software code."),
        ("Кібербезпека, інформаційна безпека, криптографія, шифрування та захист інформації [Domain technologies: кібербезпека, криптографія, захист інформації]",
         "Information Security Management. Implements security policy and monitors cyber threats and vulnerabilities.",
         "Application Development. Interprets the application design to develop and write reliable software code.")
    ]

    rehearsal_examples = []
    for anc, pos, neg in canonical_samples:
        rehearsal_examples.append(InputExample(texts=[anc, pos, neg]))
        rehearsal_examples.append(InputExample(texts=[pos, anc, neg]))
    return rehearsal_examples

def build_training_triplets(
    samples: List[FineTuneSample],
    ecf_store=None,
    feature_extractor=None,
    include_rehearsal: bool = True
) -> List[InputExample]:
    """
    Формує оптимізовані вхідні дані для контрастивного навчання:
    1. Автоматичне концептуальне якоріння запиту (Bilingual Concept Anchoring).
    2. Автоматичний відбір найсильніших хибнопозитивних конкурентів (Top-2 Hard Negative Mining).
    3. Симетричне двонаправлене навчання (Bidirectional Metric Alignment).
    4. Стратифіковане закріплення простору стандартами e-CF (Stratified Rehearsal).
    """
    train_examples: List[InputExample] = []

    for s in samples:
        query_text = s.query.strip()
        
        # 1. Двомовне контекстне якоріння (Concept Anchoring)
        if feature_extractor:
            try:
                feat_res = feature_extractor(query_text)
                if isinstance(feat_res, dict):
                    techs = feat_res.get("techs", [])
                elif isinstance(feat_res, (list, tuple)):
                    techs = feat_res[0]
                else:
                    techs = []
                if techs:
                    query_text = f"{query_text} [Domain technologies: {', '.join(techs[:5])}]"
            except Exception:
                pass

        # 2. Hard Negative Mining
        negatives = []
        if s.negative and len(s.negative.strip()) > 15 and "other it competence" not in s.negative.lower():
            negatives.append(s.negative.strip())
        
        needed_negs = max(1, 2 - len(negatives))
        mined_negs = mine_hard_negatives_from_store(query_text, s.positive, ecf_store, top_k=needed_negs)
        for mn in mined_negs:
            if mn not in negatives:
                negatives.append(mn)

        # 3. Формуємо прямі та симетричні трійки для кожного знайденого складного негативу
        for neg in negatives[:2]:
            train_examples.append(InputExample(texts=[query_text, s.positive, neg]))
            train_examples.append(InputExample(texts=[s.positive, query_text, neg]))

    print(f"[dataset_builder] Сформовано {len(train_examples)} збагачених симетричних трійок (з Hard Negative Mining).")

    # 4. Стратифікована стабілізація Rehearsal
    if include_rehearsal and len(samples) > 0:
        rehearsal_triplets = get_stratified_rehearsal_triplets()
        train_examples.extend(rehearsal_triplets)
        print(f"[dataset_builder] Додано {len(rehearsal_triplets)} стратифікованих еталонних трійок (Rehearsal A-E).")

    return train_examples

