# Project Specification: NLP-Based Risk Profiler & "Robo-Advisor"

## 1. Project Context
* [cite_start]**Project Title:** NLP-Based Risk Profiler & "Robo-Advisor" [cite: 292]
* [cite_start]**Student:** Beveridge Ekpolomo (w1994769) [cite: 293]
* [cite_start]**Degree:** BSc(Hons) Computer Science [cite: 295]
* [cite_start]**Supervisor:** Anastasia Angelopoulou [cite: 294]

## 2. Problem Definition
* [cite_start]**Core Issue:** Conventional risk profiling tools (e.g., FinaMetrica, Nutmeg) rely on static, multiple-choice questionnaires[cite: 306, 307].
* [cite_start]**Limitation:** These forms fail to capture the subtlety of a user's financial goals, time horizons, or emotional feelings about risk[cite: 307]. [cite_start]For example, a user may be conservative with a pension but aggressive with a small speculative pot[cite: 308].
* [cite_start]**Solution:** An NLP-based tool that interprets user intent from free text to generate a risk profile[cite: 311, 312].

## 3. Aims & Objectives
* [cite_start]**Aim:** Design, implement, and assess a web-based "Robo-Advisor" proof of concept that classifies risk profiles and models investment portfolios using NLP[cite: 316, 317].
* **Key Objectives:**
    1.  [cite_start]Investigate text categorisation and sentiment evaluation for financial contexts[cite: 319].
    2.  [cite_start]Develop a full-stack web application (React Frontend + Node.js/Python Backend)[cite: 320].
    3.  [cite_start]Create an NLP model to classify text into **Conservative**, **Balanced**, or **Aggressive** profiles[cite: 321].
    4.  [cite_start]Map risk profiles to specific model investment portfolios (e.g., 60% stocks / 40% bonds)[cite: 322].
    5.  [cite_start]Build a responsive UI for text input and result visualisation (charts)[cite: 323].

## 4. Scope (Proof of Concept)
* **Inclusions:**
    * [cite_start]Functional web-based prototype[cite: 326].
    * [cite_start]User Interface (React)[cite: 327].
    * [cite_start]Backend API (Node.js)[cite: 327].
    * [cite_start]NLP Model (Python)[cite: 327].
    * [cite_start]Pre-defined model portfolios[cite: 327].
* **Exclusions:**
    * [cite_start]No real financial advice[cite: 329].
    * [cite_start]No connection to real-money brokerage accounts or live market data[cite: 330].
    * [cite_start]No persistent user login/accounts (one-shot demonstration tool)[cite: 331].

## 5. Technology Stack
* [cite_start]**Frontend:** React.js (Single Page Application)[cite: 356, 357].
* [cite_start]**Backend:** Node.js & Express.js (API handling)[cite: 358, 359].
* [cite_start]**AI/NLP Engine:** Python with `scikit-learn` and `NLTK`[cite: 360].
    * [cite_start]*Note:* The Node.js backend calls the Python script/microservice for classification[cite: 362].
* [cite_start]**Database:** MongoDB (NoSQL) for storing flexible model portfolios and logging inputs[cite: 363, 364].

## 6. Functional Requirements (FR)
* [cite_start]**[FR1] Input:** Webpage with a text area for users to describe financial goals[cite: 411].
* [cite_start]**[FR2] Submission:** Single "Analyse" button to submit text[cite: 412].
* [cite_start]**[FR3] Feedback:** Loading state/message while processing[cite: 413].
* [cite_start]**[FR4] Processing:** System processes text via NLP model[cite: 414].
* [cite_start]**[FR5] Classification:** System classifies text as **Conservative**, **Balanced**, or **Aggressive**[cite: 415].
* [cite_start]**[FR6] Result Display:** User sees their classified risk profile[cite: 416].
* [cite_start]**[FR7] Portfolio Retrieval:** System pulls the linked model portfolio for that profile[cite: 417].
* [cite_start]**[FR8] Visualisation:** Display portfolio allocation as a pie or donut chart[cite: 418].
* [cite_start]**[FR9] Text Detail:** Display portfolio allocation as a text list (e.g., "50% Stocks")[cite: 419].
* [cite_start]**[FR10] Reset:** "Start Over" button on results page[cite: 421].
* [cite_start]**[FR11] Navigation:** Reset returns user to the homepage with a clear state[cite: 422].
* [cite_start]**[FR12/13] Admin:** Secure method for an Administrator to view/update asset allocations in the database[cite: 423, 424].

## 7. Non-Functional Requirements (NFR)
* [cite_start]**[NFR1] Performance:** End-to-end analysis completes in < 5 seconds[cite: 426].
* [cite_start]**[NFR2] Usability:** Minimalist UI requiring no instructions[cite: 427].
* [cite_start]**[NFR3] Reliability:** Model must return a classification (or specific error) for *any* input[cite: 428].
* [cite_start]**[NFR4] Responsiveness:** Functional on desktop and mobile browsers[cite: 429].
* [cite_start]**[NFR5] Security:** Input sanitisation to prevent injection attacks[cite: 430].

## 8. Use Case Flows
### [cite_start]Use Case 1: Profile Risk & Receive Portfolio [cite: 369]
1.  [cite_start]User enters financial goals (e.g., "I want to save for a house... happy to take risk")[cite: 375].
2.  [cite_start]User clicks "Analyse My Profile"[cite: 376].
3.  [cite_start]System classifies profile (e.g., "Balanced") via NLP[cite: 378].
4.  [cite_start]System retrieves "Balanced" portfolio data[cite: 379].
5.  [cite_start]System displays Results Page with Profile and Pie Chart[cite: 380].

### [cite_start]Use Case 2: Re-run Analysis [cite: 381]
1.  [cite_start]User clicks "Start Over" on results page[cite: 386].
2.  [cite_start]System clears session state[cite: 387].
3.  [cite_start]System navigates back to empty Homepage[cite: 388].

## 9. IPD (Interim) Targets
* [cite_start]**Current Phase:** Semester 1 (Research, Prototyping, Interim Demo)[cite: 434].
* **Development Goals for IPD:**
    * [cite_start]Set up React App and Node.js Server[cite: 437].
    * [cite_start]Build "Hello World" full-stack connection[cite: 438].
    * [cite_start]Define V1 Model Portfolios (JSON/Database)[cite: 439].
    * [cite_start]Build Basic V1 NLP Model (Simple keyword classifier)[cite: 440].

    # Project Requirements & Priorities

## 1. Must Have (Core)
* **IDs:** FR1, FR2, FR4, FR5, FR6, FR7, FR9, NFR3, NFR5.
* **Description:** The critical path from User Input → AI Classification → Result Display.

## 2. Should Have (Important)
* **IDs:** FR8, FR10, FR11, FR12, FR13, NFR1, NFR2.
* **Description:** Professional features including Charts, Admin Panel, Restart Flow, and Clean UI.

## 3. Could Have (Luxury)
* **IDs:** FR3, NFR4.
* **Description:** UX polish such as Loading states, Mobile support, and Advanced explanations.