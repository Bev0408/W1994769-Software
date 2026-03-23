# Data Schema & Synthetic Data Strategy

## 1. Overview
This schema defines the structure for the **Synthetic Data** generation required to train the NLP Risk Profiler.
* **Source Logic:** Data is generated via LLM, modelled on ONS (Office for National Statistics) UK saving habits.
* **Purpose:** To create a "perfectly balanced" dataset (33% per class) without the privacy/GDPR risks of real financial records.

## 2. Risk Profile Definitions (Class Labels)
The system classifies users into three distinct profiles. The synthetic data generation must align with these definitions:

* **Conservative:** Risk-averse. Prioritises capital preservation over growth. Typically older demographics (near retirement) or saving for immediate goals (e.g., house deposit in <2 years).
* **Balanced:** Moderate risk tolerance. Seeks a mix of growth and stability. Typical "middle-of-the-road" investor (e.g., saving for a child's future or long-term nest egg).
* **Aggressive:** High risk tolerance. Prioritises maximum growth despite volatility. Often younger demographics or those with "play money" (e.g., Crypto, high-growth stocks).

## 3. Database Schema (MongoDB - `Portfolios` Collection)
This collection stores the "Model Portfolios" that the system retrieves *after* classification.

**Collection Name:** `portfolios`

```json
{
  "_id": "ObjectId",
  "risk_profile": "String (Conservative | Balanced | Aggressive)",
  "description": "String (User-facing explanation of the strategy)",
  "asset_allocation": {
    "stocks": "Number (Integer %)",
    "bonds": "Number (Integer %)",
    "cash": "Number (Integer %)",
    "crypto": "Number (Integer %)" 
  },
  "visualisation_color": "String (Hex Code, e.g., #4CAF50)",
  "last_updated": "Date (ISO 8601)"
}

## Example Document (Aggressive Portfolio)
{
  "risk_profile": "Aggressive",
  "description": "Designed for maximum growth over a long time horizon (10+ years). High volatility expected.",
  "asset_allocation": {
    "stocks": 70,
    "bonds": 10,
    "cash": 5,
    "crypto": 15
  },
  "visualisation_color": "#FF5733"
}