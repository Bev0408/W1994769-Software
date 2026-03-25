# System Architecture & Technical Design

## 1. High-Level Overview
This project follows a **Distributed Service-Oriented Architecture**. It separates the User Interface, API Logic, and Artificial Intelligence processing into distinct layers to ensure modularity and scalability.

* **Frontend (Client):** React.js (Single Page Application)
* **Backend (Server):** Node.js & Express.js (REST API)
* **AI Engine (ML Service):** Python (Scikit-learn / NLTK)
* **Database:** MongoDB (NoSQL)

## 2. Project Directory Structure

```text
/w1994769-Software
│
├── /client                     # Frontend (React.js + Vite)
│   ├── /src
│   │   ├── /api
│   │   │   └── analyze.js      # Axios client for backend API calls
│   │   ├── /components
│   │   │   ├── Admin.jsx        # Admin panel: view & update portfolios (FR12, FR13)
│   │   │   ├── Admin.css
│   │   │   ├── InputForm.jsx    # Text input + Analyse button (FR1, FR2, FR3)
│   │   │   ├── InputForm.css
│   │   │   ├── PieChart.jsx     # Doughnut chart visualisation (FR8)
│   │   │   ├── Results.jsx      # Risk profile + portfolio display (FR6, FR9)
│   │   │   └── Results.css
│   │   ├── App.jsx              # Root component, state management
│   │   ├── App.css
│   │   └── index.css            # Base reset styles
│   ├── index.html
│   └── package.json
│
├── /server                     # Backend (Node.js + Express)
│   ├── /models
│   │   └── Portfolio.js        # Mongoose schema for portfolio documents
│   ├── server.js               # Entry point — all routes defined here
│   ├── .env                    # Environment variables (MONGO_URI, PORT)
│   └── package.json
│
├── /ml_service                 # AI Engine (Python)
│   ├── /models
│   │   ├── classifier.pkl      # Trained SVM classifier
│   │   └── vectorizer.pkl      # Fitted TF-IDF vectorizer
│   ├── /scripts
│   │   ├── generate_data.py    # Synthetic training data generation
│   │   ├── train_model.py      # Model training (SVM + TF-IDF)
│   │   ├── predict.py          # Inference — called by Node via child_process
│   │   └── evaluate.py         # F1 score + confusion matrix evaluation
│   ├── /data
│   │   └── training_data.csv   # 500 synthetic samples (balanced, 3 classes)
│   └── requirements.txt        # Python dependencies
│
├── /Relevant info              # Project documentation
│   ├── Final Year Project - Details.md
│   ├── Architecture.md         # This file
│   └── Data Schema.md
│
└── CHANGES.md                  # Enhancements beyond original requirements
```

## 3. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Accepts user text, runs NLP classification, returns risk profile + portfolio |
| `GET` | `/api/portfolios` | Returns all 3 model portfolio definitions from MongoDB |
| `PUT` | `/api/portfolios/:risk_profile` | Updates asset allocation for a given portfolio (admin) |
| `GET` | `/api/evaluation` | Runs evaluate.py and returns F1 score + confusion matrix |
| `GET` | `/api/health` | Health check endpoint |

## 4. Data Flow

```
User Input (text)
      │
      ▼
InputForm.jsx  ──POST /api/analyze──▶  server.js
                                            │
                                    sanitizeInput()
                                            │
                                    spawn predict.py
                                            │
                                    predict.py (SVM + TF-IDF)
                                            │
                                    risk_profile + confidence
                                            │
                                    Portfolio.findOne() → MongoDB
                                            │
                                    JSON response
                                            │
      ▼
Results.jsx (risk badge, doughnut chart, allocation bars)
```

## 5. ML Pipeline

1. **Training data** — 500 synthetic text samples (167 per class) generated using `generate_data.py`, modelled on ONS UK saving habits demographics
2. **Preprocessing** — Lowercase → remove special chars → tokenise → remove stopwords → lemmatise (NLTK)
3. **Feature extraction** — TF-IDF vectorisation (1,000 features, unigrams + bigrams)
4. **Classifier** — Linear SVM (`sklearn.SVC`, `kernel='linear'`, `probability=True`)
5. **Evaluation** — 80/20 stratified train/test split (`random_state=42`), weighted F1 score target ≥ 70%
6. **Inference** — Node.js spawns `predict.py` as a child process, receives JSON via stdout

## 6. Key Design Decisions

* **Routes in `server.js`** — All Express routes are defined directly in `server.js` rather than separate route/controller files. Given the small number of endpoints, this keeps the structure simple and readable without unnecessary abstraction.
* **Python as child process** — Rather than a separate Python microservice, `predict.py` is spawned on demand. Simpler deployment, no inter-service networking required.
* **Synthetic data** — Avoids GDPR/privacy risks of using real financial records while allowing a perfectly balanced class distribution.
* **MongoDB** — Schema-flexible NoSQL store suited to the evolving portfolio document structure; Mongoose provides schema validation.
