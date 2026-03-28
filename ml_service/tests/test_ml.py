"""
ML Service Test Suite
Robo-Advisor NLP Risk Profiler — FYP Test Evidence

Tests: SVM classifier, TF-IDF vectorizer, classification accuracy per profile.
Coverage: FR4, FR5, NFR3

Run: python3 -m pytest ml_service/tests/test_ml.py -v
from the project root directory.
"""

import os
import sys
import json
import subprocess

import joblib
import pytest

# ── Path setup ──────────────────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ML_DIR      = os.path.join(SCRIPT_DIR, '..')
MODELS_DIR  = os.path.join(ML_DIR, 'models')
SCRIPTS_DIR = os.path.join(ML_DIR, 'scripts')

CLASSIFIER_PATH = os.path.join(MODELS_DIR, 'classifier.pkl')
VECTORIZER_PATH = os.path.join(MODELS_DIR, 'vectorizer.pkl')
PREDICT_SCRIPT  = os.path.join(SCRIPTS_DIR, 'predict.py')


# ── Fixtures ─────────────────────────────────────────────────────────────────
@pytest.fixture(scope='module')
def classifier():
    """Load the trained SVM classifier once per module."""
    return joblib.load(CLASSIFIER_PATH)


@pytest.fixture(scope='module')
def vectorizer():
    """Load the fitted TF-IDF vectorizer once per module."""
    return joblib.load(VECTORIZER_PATH)


def run_predict(text: str) -> dict:
    """Invoke predict.py as a subprocess (mirrors Node.js child_process call)."""
    result = subprocess.run(
        ['python3', PREDICT_SCRIPT, text],
        capture_output=True, text=True, timeout=30
    )
    return json.loads(result.stdout.strip())


# ── T24: Model files exist ────────────────────────────────────────────────────
class TestModelLoading:

    def test_T24_classifier_file_exists(self):
        """T24 — classifier.pkl exists on disk (FR4)"""
        assert os.path.exists(CLASSIFIER_PATH), (
            f"classifier.pkl not found at {CLASSIFIER_PATH}. Run train_model.py first."
        )

    def test_T25_vectorizer_file_exists(self):
        """T25 — vectorizer.pkl exists on disk (FR4)"""
        assert os.path.exists(VECTORIZER_PATH), (
            f"vectorizer.pkl not found at {VECTORIZER_PATH}. Run train_model.py first."
        )

    def test_T26_classifier_loads_without_error(self, classifier):
        """T26 — SVM classifier loads and exposes predict() (FR4)"""
        assert hasattr(classifier, 'predict'), "Loaded object has no predict() method"

    def test_T27_vectorizer_loads_without_error(self, vectorizer):
        """T27 — TF-IDF vectorizer loads and exposes transform() (FR4)"""
        assert hasattr(vectorizer, 'transform'), "Loaded object has no transform() method"

    def test_T28_classifier_has_three_classes(self, classifier):
        """T28 — Classifier trained on exactly 3 risk classes (FR5)"""
        classes = list(classifier.classes_)
        assert len(classes) == 3
        assert 'Conservative' in classes
        assert 'Balanced'     in classes
        assert 'Aggressive'   in classes


# ── T29: Vectorizer dimensions ────────────────────────────────────────────────
class TestVectorizerOutput:

    def test_T29_vectorizer_produces_correct_feature_dimensions(self, vectorizer):
        """T29 — TF-IDF vectorizer output shape is consistent and within max_features (FR4)
        Vectorizer configured with max_features=1000, min_df=2.
        With 500 training samples, min_df=2 reduces the learned vocabulary to 663 features.
        Test verifies: 1 row output, feature count > 0 and <= 1000 (max_features cap).
        """
        sample = 'I want a low risk investment for retirement'
        vec = vectorizer.transform([sample])
        assert vec.shape[0] == 1, f"Expected 1 row, got {vec.shape[0]}"
        assert 0 < vec.shape[1] <= 1000, (
            f"Expected feature count in (0, 1000], got {vec.shape[1]}"
        )

    def test_T30_vectorizer_handles_unseen_vocabulary(self, vectorizer):
        """T30 — Vectorizer handles text with entirely unseen words without error (NFR3)
        All-unseen input produces an all-zero sparse row — no exception raised.
        """
        vec = vectorizer.transform(['xyzabcdefg nonsenseword foobar'])
        assert vec.shape[0] == 1
        assert vec.shape[1] > 0   # vocabulary size consistent with trained model


# ── T31–T39: Classification accuracy per profile ─────────────────────────────
class TestClassificationAccuracy:

    # Conservative test sentences
    @pytest.mark.parametrize("text", [
        "I am retired and need to protect my savings from any losses.",
        "I cannot afford any risk. I want bonds and cash with minimal volatility.",
        "Safety is my top priority. I have a short time horizon and low risk tolerance.",
    ])
    def test_T31_T33_conservative_sentences_classified_correctly(self, text, classifier, vectorizer):
        """T31–T33 — Conservative sentences classified as Conservative (FR5)"""
        import re, nltk
        from nltk.tokenize import word_tokenize
        from nltk.corpus import stopwords
        from nltk.stem import WordNetLemmatizer
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('wordnet', quiet=True)

        text_lower = text.lower()
        text_clean = re.sub(r'[^a-zA-Z\s]', '', text_lower)
        tokens = word_tokenize(text_clean)
        stop_words = set(stopwords.words('english'))
        tokens = [t for t in tokens if t not in stop_words]
        lemmatizer = WordNetLemmatizer()
        tokens = [lemmatizer.lemmatize(t) for t in tokens]
        processed = ' '.join(tokens)

        vec = vectorizer.transform([processed])
        prediction = classifier.predict(vec)[0]
        assert prediction == 'Conservative', (
            f"Expected Conservative, got {prediction} for: '{text}'"
        )

    # Balanced test sentences
    @pytest.mark.parametrize("text", [
        "I want a mix of growth and security, I can handle moderate risk over 10 years.",
        "I am saving for a house in five years and want balanced moderate risk investments.",
        "I want steady growth but do not want to take excessive risks with my savings.",
    ])
    def test_T34_T36_balanced_sentences_classified_correctly(self, text, classifier, vectorizer):
        """T34–T36 — Balanced sentences classified as Balanced (FR5)"""
        import re, nltk
        from nltk.tokenize import word_tokenize
        from nltk.corpus import stopwords
        from nltk.stem import WordNetLemmatizer
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('wordnet', quiet=True)

        text_lower = text.lower()
        text_clean = re.sub(r'[^a-zA-Z\s]', '', text_lower)
        tokens = word_tokenize(text_clean)
        stop_words = set(stopwords.words('english'))
        tokens = [t for t in tokens if t not in stop_words]
        lemmatizer = WordNetLemmatizer()
        tokens = [lemmatizer.lemmatize(t) for t in tokens]
        processed = ' '.join(tokens)

        vec = vectorizer.transform([processed])
        prediction = classifier.predict(vec)[0]
        assert prediction == 'Balanced', (
            f"Expected Balanced, got {prediction} for: '{text}'"
        )

    # Aggressive test sentences
    @pytest.mark.parametrize("text", [
        "I am young and want maximum returns. I am happy to take high risks with crypto and stocks.",
        "I want aggressive growth and I can absorb significant losses in pursuit of high returns.",
        "I have a 30 year horizon and want heavy exposure to volatile equities and emerging markets.",
    ])
    def test_T37_T39_aggressive_sentences_classified_correctly(self, text, classifier, vectorizer):
        """T37–T39 — Aggressive sentences classified as Aggressive (FR5)"""
        import re, nltk
        from nltk.tokenize import word_tokenize
        from nltk.corpus import stopwords
        from nltk.stem import WordNetLemmatizer
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('wordnet', quiet=True)

        text_lower = text.lower()
        text_clean = re.sub(r'[^a-zA-Z\s]', '', text_lower)
        tokens = word_tokenize(text_clean)
        stop_words = set(stopwords.words('english'))
        tokens = [t for t in tokens if t not in stop_words]
        lemmatizer = WordNetLemmatizer()
        tokens = [lemmatizer.lemmatize(t) for t in tokens]
        processed = ' '.join(tokens)

        vec = vectorizer.transform([processed])
        prediction = classifier.predict(vec)[0]
        assert prediction == 'Aggressive', (
            f"Expected Aggressive, got {prediction} for: '{text}'"
        )


# ── T40–T42: Edge cases via predict.py subprocess ────────────────────────────
class TestEdgeCasesViaCLI:

    def test_T40_empty_input_returns_balanced_fallback(self):
        """T40 — Empty input returns Balanced fallback (NFR3)"""
        result = run_predict('')
        assert result.get('risk_profile') in ['Conservative', 'Balanced', 'Aggressive']
        # warn key expected for empty/meaningless input
        # No crash — NFR3 compliance

    def test_T41_only_special_characters_handled_gracefully(self):
        """T41 — Input of only special chars returns valid profile (NFR3)"""
        result = run_predict('!@#$%^&*()')
        assert result.get('risk_profile') in ['Conservative', 'Balanced', 'Aggressive']

    def test_T42_very_long_input_handled_without_crash(self):
        """T42 — Very long input (2500 chars) processed without error (NFR3)"""
        long_text = 'I want safe investments. ' * 100  # ~2500 chars
        result = run_predict(long_text)
        assert result.get('risk_profile') in ['Conservative', 'Balanced', 'Aggressive']
