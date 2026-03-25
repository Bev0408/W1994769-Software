"""
NLP Risk Profiler - Model Evaluation Script
Computes F1 score and confusion matrix on the held-out test set.
Outputs JSON for the admin dashboard.
Target: Weighted F1 >= 70%
"""

import json
import os
import re
import sys

import joblib
import nltk
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from sklearn.metrics import confusion_matrix, f1_score
from sklearn.model_selection import train_test_split

nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)


def preprocess_text(text: str) -> str:
    """Same preprocessing pipeline as train_model.py."""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = word_tokenize(text)
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t not in stop_words]
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return ' '.join(tokens)


def evaluate():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '..', 'data', 'training_data.csv')
    models_dir = os.path.join(script_dir, '..', 'models')

    # Load data and recreate the same 80/20 split (random_state=42)
    df = pd.read_csv(data_path)
    df['processed_text'] = df['text'].apply(preprocess_text)

    _, X_test, _, y_test = train_test_split(
        df['processed_text'],
        df['risk_profile'],
        test_size=0.2,
        random_state=42,
        stratify=df['risk_profile']
    )

    # Load saved model and vectorizer
    classifier = joblib.load(os.path.join(models_dir, 'classifier.pkl'))
    vectorizer = joblib.load(os.path.join(models_dir, 'vectorizer.pkl'))

    X_test_vec = vectorizer.transform(X_test)
    y_pred = classifier.predict(X_test_vec)

    # F1 score (weighted)
    f1 = f1_score(y_test, y_pred, average='weighted')

    # Confusion matrix - fixed label order
    labels = ['Conservative', 'Balanced', 'Aggressive']
    cm = confusion_matrix(y_test, y_pred, labels=labels)

    result = {
        'f1_score': round(float(f1), 4),
        'f1_percent': round(float(f1) * 100, 1),
        'target_met': bool(f1 >= 0.70),
        'test_size': len(y_test),
        'labels': labels,
        'confusion_matrix': cm.tolist()
    }

    print(json.dumps(result))


if __name__ == '__main__':
    evaluate()
