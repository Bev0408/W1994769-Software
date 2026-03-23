# System Architecture & Technical Design

## 1. High-Level Overview
This project follows a **Distributed Service-Oriented Architecture**. It separates the User Interface, API Logic, and Artificial Intelligence processing into distinct layers to ensure modularity and scalability.

* **Frontend (Client):** React.js (Single Page Application)
* **Backend (Server):** Node.js & Express.js (REST API)
* **AI Engine (ML Service):** Python (Scikit-learn / NLTK)
* **Database:** MongoDB (NoSQL)

## 2. Project Directory Structure
The agent should organize the codebase into this standard structure to keep the ML logic separate from the web server.

```text
/robo-advisor-project
│
├── /client                 # Frontend (React.js)
│   ├── /src
│   │   ├── /components     # UI Components (InputForm, Charts, Results)
│   │   ├── /api            # Axios/Fetch services to talk to Backend
│   │   └── App.js
│   └── package.json
│
├── /server                 # Backend (Node.js + Express)
│   ├── /models             # Mongoose Schemas (Portfolio.js)
│   ├── /routes             # API Routes (analysis.js, admin.js)
│   ├── /controllers        # Logic for handling requests
│   ├── server.js           # Entry point
│   └── package.json
│
├── /ml_service             # AI Engine (Python)
│   ├── /models             # Saved .pkl models (classifier.pkl, vectorizer.pkl)
│   ├── /scripts            # Python scripts (train_model.py, predict.py)
│   ├── /data               # Synthetic training data (training_data.csv)
│   └── requirements.txt    # Python dependencies (scikit-learn, nltk, pandas)
│
└── /docs                   # Documentation Artifacts
    ├── PPRS.md
    ├── data_schema.md
    └── architecture.md

    