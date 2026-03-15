"""
NLP Risk Profiler - Prediction Script
Accepts text input and returns JSON classification result
Called by Node.js backend as a child process
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

# Suppress NLTK download messages
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)


def preprocess_text(text: str) -> str:
    """Clean and preprocess text for NLP (must match training preprocessing)."""
    # Lowercase
    text = text.lower()
    
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t not in stop_words]
    
    # Lemmatize
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    
    return ' '.join(tokens)


def predict(text: str) -> dict:
    """Predict risk profile from input text."""
    # Load models
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, "..", "models")
    
    classifier_path = os.path.join(models_dir, "classifier.pkl")
    vectorizer_path = os.path.join(models_dir, "vectorizer.pkl")
    
    # Check if models exist
    if not os.path.exists(classifier_path) or not os.path.exists(vectorizer_path):
        return {
            "error": "Models not found. Please run train_model.py first.",
            "risk_profile": "Balanced",  # Fallback (NFR3)
            "confidence": 0.33
        }
    
    try:
        classifier = joblib.load(classifier_path)
        vectorizer = joblib.load(vectorizer_path)
        
        # Preprocess input
        processed = preprocess_text(text)
        
        # Handle empty input after preprocessing
        if not processed.strip():
            return {
                "risk_profile": "Balanced",  # Fallback (NFR3)
                "confidence": 0.33,
                "warning": "Input too short or contained no meaningful content"
            }
        
        # Vectorize and predict
        text_vec = vectorizer.transform([processed])
        prediction = classifier.predict(text_vec)[0]
        probabilities = classifier.predict_proba(text_vec)[0]
        
        # Get confidence for predicted class
        class_index = list(classifier.classes_).index(prediction)
        confidence = float(probabilities[class_index])
        
        return {
            "risk_profile": prediction,
            "confidence": round(confidence, 2)
        }
        
    except Exception as e:
        # Fallback classification if anything goes wrong (NFR3)
        return {
            "risk_profile": "Balanced",
            "confidence": 0.33,
            "error": str(e)
        }


def main():
    """Main entry point - accepts text from command line or stdin."""
    if len(sys.argv) > 1:
        # Text passed as argument
        text = ' '.join(sys.argv[1:])
    else:
        # Read from stdin
        text = sys.stdin.read().strip()
    
    if not text:
        result = {
            "risk_profile": "Balanced",
            "confidence": 0.33,
            "warning": "No input provided"
        }
    else:
        result = predict(text)
    
    # Output JSON for Node.js to parse
    print(json.dumps(result))


if __name__ == "__main__":
    main()
