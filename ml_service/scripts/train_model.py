"""
NLP Risk Profiler - Model Training Script
Trains an SVM classifier with TF-IDF vectorization
Target: F1 score >= 70%
"""

import os
import pandas as pd
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score
import joblib
import re

# Download NLTK data
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)


def preprocess_text(text: str) -> str:
    """Clean and preprocess text for NLP."""
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


def train_model():
    """Train the risk classification model."""
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "..", "data", "training_data.csv")
    models_dir = os.path.join(script_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Load data
    print("Loading training data...")
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples")
    
    # Preprocess text
    print("Preprocessing text...")
    df['processed_text'] = df['text'].apply(preprocess_text)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        df['processed_text'], 
        df['risk_profile'],
        test_size=0.2,
        random_state=42,
        stratify=df['risk_profile']
    )
    print(f"Train set: {len(X_train)}, Test set: {len(X_test)}")
    
    # TF-IDF Vectorization
    print("Vectorizing with TF-IDF...")
    vectorizer = TfidfVectorizer(
        max_features=1000,
        ngram_range=(1, 2),  # Unigrams and bigrams
        min_df=2
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Train SVM Classifier
    print("Training SVM classifier...")
    classifier = SVC(
        kernel='linear',
        C=1.0,
        probability=True,  # Enable probability estimates
        random_state=42
    )
    classifier.fit(X_train_vec, y_train)
    
    # Evaluate
    print("\n" + "="*50)
    print("MODEL EVALUATION")
    print("="*50)
    
    y_pred = classifier.predict(X_test_vec)
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # F1 Score (weighted for multi-class)
    f1 = f1_score(y_test, y_pred, average='weighted')
    print(f"\n✓ Weighted F1 Score: {f1:.2%}")
    
    if f1 >= 0.70:
        print("✓ Target F1 >= 70% ACHIEVED!")
    else:
        print("✗ Target F1 >= 70% NOT MET - consider retraining or adding more data")
    
    # Save models
    classifier_path = os.path.join(models_dir, "classifier.pkl")
    vectorizer_path = os.path.join(models_dir, "vectorizer.pkl")
    
    joblib.dump(classifier, classifier_path)
    joblib.dump(vectorizer, vectorizer_path)
    
    print(f"\n✓ Saved classifier to: {classifier_path}")
    print(f"✓ Saved vectorizer to: {vectorizer_path}")
    
    return f1


if __name__ == "__main__":
    train_model()
