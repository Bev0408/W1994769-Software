"""
NLP Risk Profiler - Prediction Script
Accepts text input and returns JSON classification result
Called by Node.js backend as a child process

Supports two modes:
  1. Single-shot: python predict.py "some text"   (local dev / testing)
  2. Persistent:  python predict.py --stdin        (production — models loaded once)
"""

import sys
import json
import os
import joblib
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Point NLTK to the pre-downloaded data directory (baked in at build time)
# Falls back to default NLTK path if not found (e.g. local dev)
script_dir = os.path.dirname(os.path.abspath(__file__))
nltk_data_dir = os.path.join(script_dir, '..', 'nltk_data')
if os.path.exists(nltk_data_dir):
    nltk.data.path.insert(0, nltk_data_dir)

# Download only if not already present
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)


def preprocess_text(text: str) -> str:
    """Clean and preprocess text for NLP (must match training preprocessing)."""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = word_tokenize(text)
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t not in stop_words]
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return ' '.join(tokens)


def predict(text: str) -> dict:
    """Predict risk profile from input text (single-shot mode)."""
    _script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(_script_dir, "..", "models")
    classifier_path = os.path.join(models_dir, "classifier.pkl")
    vectorizer_path = os.path.join(models_dir, "vectorizer.pkl")

    if not os.path.exists(classifier_path) or not os.path.exists(vectorizer_path):
        return {
            "error": "Models not found. Please run train_model.py first.",
            "risk_profile": "Balanced",
            "confidence": 0.33
        }

    try:
        classifier = joblib.load(classifier_path)
        vectorizer = joblib.load(vectorizer_path)
        return _classify(text, classifier, vectorizer)
    except Exception as e:
        return {"risk_profile": "Balanced", "confidence": 0.33, "error": str(e)}


def _classify(text: str, classifier, vectorizer) -> dict:
    """Run inference given already-loaded classifier and vectorizer."""
    processed = preprocess_text(text)

    if not processed.strip():
        return {
            "risk_profile": "Balanced",
            "confidence": 0.33,
            "warning": "Input too short or contained no meaningful content"
        }

    text_vec = vectorizer.transform([processed])
    prediction = classifier.predict(text_vec)[0]
    probabilities = classifier.predict_proba(text_vec)[0]
    class_index = list(classifier.classes_).index(prediction)
    confidence = float(probabilities[class_index])

    return {
        "risk_profile": prediction,
        "confidence": round(confidence, 2)
    }


def main():
    """Main entry point."""

    # ── Persistent stdin mode (production) ──────────────────────────────────
    # Node.js starts this process once at server startup and reuses it.
    # Models are loaded once; each line of stdin is a text to classify.
    if '--stdin' in sys.argv:
        _script_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(_script_dir, '..', 'models')

        try:
            classifier = joblib.load(os.path.join(models_dir, 'classifier.pkl'))
            vectorizer = joblib.load(os.path.join(models_dir, 'vectorizer.pkl'))
            loaded = True
        except Exception as e:
            loaded = False
            load_error = str(e)

        # Signal to Node.js that the worker is ready
        sys.stdout.write('{"ready":true}\n')
        sys.stdout.flush()

        # Process one request per line
        for line in sys.stdin:
            text = line.strip()
            if not text:
                result = {"risk_profile": "Balanced", "confidence": 0.33, "warning": "No input"}
            elif not loaded:
                result = {"risk_profile": "Balanced", "confidence": 0.33, "error": load_error}
            else:
                try:
                    result = _classify(text, classifier, vectorizer)
                except Exception as e:
                    result = {"risk_profile": "Balanced", "confidence": 0.33, "error": str(e)}

            sys.stdout.write(json.dumps(result) + '\n')
            sys.stdout.flush()
        return

    # ── Single-shot mode (local dev / testing) ──────────────────────────────
    if len(sys.argv) > 1:
        text = ' '.join(a for a in sys.argv[1:] if a != '--stdin')
    else:
        text = sys.stdin.read().strip()

    if not text:
        result = {"risk_profile": "Balanced", "confidence": 0.33, "warning": "No input provided"}
    else:
        result = predict(text)

    print(json.dumps(result))


if __name__ == "__main__":
    main()
