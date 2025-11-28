# feedback_ml.py
import os
import joblib
import numpy as np
from collections import Counter
from typing import List, Tuple

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "ml_models")
VECT_FILE = os.path.join(MODEL_DIR, "vectorizer.pkl")
MLB_FILE = os.path.join(MODEL_DIR, "mlb.pkl")
MODEL_FILE = os.path.join(MODEL_DIR, "model.pkl")



import re

def contains_word(word, text):
    return re.search(rf"\b{re.escape(word)}\b", text) is not None



def models_exist():
    return os.path.exists(VECT_FILE) and os.path.exists(MLB_FILE) and os.path.exists(MODEL_FILE)

def load_models():
    """
    Load and return (vectorizer, mlb, model). Raises FileNotFoundError if not present.
    """
    if not models_exist():
        raise FileNotFoundError("ML model files not found in ml_models/. Run train_feedback_model.py first.")
    vect = joblib.load(VECT_FILE)
    mlb = joblib.load(MLB_FILE)
    model = joblib.load(MODEL_FILE)
    return vect, mlb, model



def auto_train_if_needed():
    """
    Only trains model if model files are missing.
    (Full retrain on every backend restart is handled separately.)
    """
    from train_feedback_model import main as train_main

    # check model files
    vect_exists = os.path.exists(VECT_FILE)
    mlb_exists = os.path.exists(MLB_FILE)
    model_exists = os.path.exists(MODEL_FILE)

    # If any file missing → train
    if not (vect_exists and mlb_exists and model_exists):
        print("⚠️ Model missing — training now...")
        train_main()
    else:
        print("✔ Model files exist — no auto-training needed.")



def predict_labels_for_comments(comments: List[str], threshold: float = 0.4):
    """
    Predict multi-labels for each comment string.
    Returns:
      labels_per_comment: List[List[str]]
      probs_per_comment: List[dict] or None
    """


    auto_train_if_needed()


    vect, mlb, model = load_models()
    texts = [c if isinstance(c, str) else "" for c in comments]
    X = vect.transform(texts)

    # predict_proba may or may not exist depending on sklearn wrapper; try it first
    probs = None
    if hasattr(model, "predict_proba"):
        try:
            probs = model.predict_proba(X)
        except Exception:
            probs = None

    if probs is None and hasattr(model, "decision_function"):
        decisions = model.decision_function(X)
        probs = 1 / (1 + np.exp(-decisions))  # sigmoid

    # Fallback: if still None, use predict (binary rows)
    if probs is None:
        pred = model.predict(X)
        labels_per_comment = []
        for row in pred:
            labels_per_comment.append([mlb.classes_[i] for i, v in enumerate(row) if v == 1])
        return labels_per_comment, None

    labels_per_comment = []
    prob_per_comment = []
    for row in probs:
        chosen = [mlb.classes_[i] for i, p in enumerate(row) if p >= threshold]
        labels_per_comment.append(chosen)
        prob_per_comment.append({mlb.classes_[i]: float(row[i]) for i in range(len(row))})
    return labels_per_comment, prob_per_comment

def aggregate_labels_from_labellists(labellists):
    """
    labellists: List[List[str]] -> aggregate into counts dict and sorted list.
    """
    ctr = Counter()
    for labs in labellists:
        for l in labs:
            ctr[l] += 1
    sorted_list = ctr.most_common()
    return dict(ctr), sorted_list

# def build_suggestion_paragraph(label_counts: dict, top_n: int = 3) -> str:
#     if not label_counts:
#         return "No specific issues found in recent feedback."
#     SUG_MAP = {
#         "oily": "Reduce oil used in preparation and frying.",
#         "cold": "Ensure items are served hot; review serving/holding process.",
#         "salty": "Reduce salt level slightly.",
#         "spicy": "Consider offering a milder spice level.",
#         "stale": "Check ingredients’ freshness and storage.",
#         "raw": "Review cooking time/temperature to ensure proper cooking.",
#         "hard": "Adjust preparation to improve texture and softness.",
#         "overcooked": "Reduce cooking time or lower heat to avoid overcooking.",
#         "undercooked": "Increase cooking time/temperature to fully cook items.",
#         "bland": "Adjust seasoning to improve taste.",
#         "quality_low": "Audit ingredient quality and supplier/process.",
#         "quantity_low": "Increase portion size to meet expectations."
#     }
#     sorted_labels = sorted(label_counts.items(), key=lambda x: x[1], reverse=True)
#     top = [l for l, _ in sorted_labels[:top_n]]
#     issues_phrase = ", ".join([f"{l} ({label_counts[l]} reports)" for l in top])
#     suggestions = " ".join([SUG_MAP.get(l, "") for l in top])
#     paragraph = f"Recent feedback indicates: {issues_phrase}. {suggestions}".strip()
#     return paragraph


def combine_with_sentiment(issue_counts: dict, comments: list):
    """
    Medium-level reasoning: combine ML issue detection + sentiment.
    """
    positive_words = ["good", "nice", "excellent", "fantastic", "amazing", "tasty", "loved"]
    negative_words = ["bad", "cold", "oily", "stale", "worst", "not good", "tasteless"]

    pos = sum(
        any(contains_word(w, c.lower()) for w in positive_words)
        for c in comments
    )

    neg = sum(
        any(contains_word(w, c.lower()) for w in negative_words)
        for c in comments
    )

    # --- sentiment summary ---
    if pos > neg:
        sentiment_summary = "Most students enjoyed the food overall."
    elif neg > pos:
        sentiment_summary = "Students reported several issues with this food."
    else:
        sentiment_summary = "The feedback is mixed."

    if not issue_counts:
        return sentiment_summary + " No specific issues were detected."

    # --- issue phrase ---
    issues = ", ".join(issue_counts.keys())

    # --- action mapping ---
    ACTION_MAP = {
        "oily": "Reduce oil used in preparation and frying.",
        "cold": "Ensure items are served hot; review serving/holding process.",
        "salty": "Reduce salt level slightly.",
        "spicy": "Consider offering a milder spice level.",
        "stale": "Check ingredients’ freshness and storage.",
        "raw": "Review cooking time/temperature to ensure proper cooking.",
        "hard": "Adjust preparation to improve texture and softness.",
        "overcooked": "Reduce cooking time or lower heat to avoid overcooking.",
        "undercooked": "Increase cooking time/temperature to fully cook items.",
        "bland": "Adjust seasoning to improve taste.",
        "quality_low": "Audit ingredient quality and supplier/process.",
        "quantity_low": "Increase portion size to meet expectations."
    }

    actions = [ACTION_MAP.get(i, "") for i in issue_counts.keys()]
    actions = "; ".join([a for a in actions if a])

    final_text = (
        f"{sentiment_summary} "
        f"However, some students mentioned: {issues}. "
        f"Consider to {actions}."
    )

    return final_text


# ============================
# TRAIN MODEL ON SERVER STARTUP
# ============================
try:
    print("🔁 Training model on server startup...")
    from train_feedback_model import main as train_main
    train_main()
    print("✔ Startup training completed.")
except Exception as e:
    print("❌ Startup training failed:", e)
