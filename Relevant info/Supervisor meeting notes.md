# Supervisor Meeting Notes & Technical Decisions

## 1. Data Strategy
* **Source:** Open data sources for financial forms.
* **Constraint:** Privacy restrictions exist on real financial data.
* **Current Plan:** Generate synthetic data using an LLM, based on ONS data regarding UK saving habits.
* **Benefit:** Ensures a perfect balance of profiles without ethical risk concerns.
* **Conflict:** Supervisor is currently "heavily insisting" on the use of real data despite these initial notes.

## 2. Evaluation Metrics
* **Goal:** 70% F1 Score.
* **Method:** Visualise specific misclassification patterns (Conservative vs. Balanced vs. Aggressive) using a Confusion Matrix.

## 3. NLP Pipeline Specifications
| Stage | Technique / Tool | Purpose |
| :--- | :--- | :--- |
| **Pre-processing** | NLTK (word_tokenize), Stop-word removal | Cleaning noise and breaking text into units. |
| **Feature Extraction**| TF-IDF Vectorisation (scikit-learn) | Converting text to numbers, weighting financial keywords. |
| **Classification** | Support Vector Machine (SVM) | Algorithm to draw decision boundaries between profiles. |
| **Library** | scikit-learn (Python) | Industry-standard library for the ML pipeline. |