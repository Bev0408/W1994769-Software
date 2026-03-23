# Project Requirements & Development Priorities

## 1. Critical Path (Must Have)
**Priority:** High - *These features constitute the MVP (Minimum Viable Product) required for the IPD.*

| ID | Feature Name | Description | Status |
| :--- | :--- | :--- | :--- |
| **FR1** | User Input | [cite_start]A webpage with a text area for users to describe financial goals[cite: 411]. | Pending |
| **FR2** | Submission Trigger | [cite_start]A single "Analyse" button to submit the text for processing[cite: 412]. | Pending |
| **FR4** | NLP Processing | [cite_start]The backend must accept the text and pass it to the Python NLP model[cite: 414]. | Pending |
| **FR5** | Risk Classification | [cite_start]The system must classify the input as "Conservative", "Balanced", or "Aggressive"[cite: 415]. | Pending |
| **FR6** | Result Display | [cite_start]The user must see their classified Risk Profile clearly on the results page[cite: 416]. | Pending |
| **FR7** | Portfolio Retrieval | [cite_start]The system must fetch the specific asset allocation (JSON) linked to the risk profile[cite: 417]. | Pending |
| **FR9** | Textual Breakdown | [cite_start]Display the portfolio details as a text list (e.g., "60% Stocks, 40% Bonds")[cite: 419]. | Pending |
| **NFR3** | Model Reliability | [cite_start]The system must handle *any* input text without crashing, returning a fallback if unsure[cite: 428]. | Pending |
| **NFR5** | Input Security | [cite_start]The backend must sanitise text inputs to prevent code injection attacks[cite: 430]. | Pending |

## 2. Professional Features (Should Have)
**Priority:** Medium - *Implement these only after the Critical Path is fully functional.*

| ID | Feature Name | Description | Status |
| :--- | :--- | :--- | :--- |
| **FR8** | Visualisation | [cite_start]Display the portfolio allocation using a Chart.js Pie or Doughnut chart[cite: 418]. | Pending |
| **FR10** | Reset Flow | [cite_start]A "Start Over" button on the results page[cite: 421]. | Pending |
| **FR11** | State Clearing | [cite_start]Clicking reset clears the session and returns the user to a blank homepage[cite: 422]. | Pending |
| **FR12** | Admin Access | [cite_start]A secure method (API endpoint or simple login) to view portfolio definitions[cite: 423]. | Pending |
| **FR13** | Portfolio Updates | [cite_start]The ability for an Admin to update asset percentages in the database[cite: 424]. | Pending |
| **NFR1** | Performance | [cite_start]End-to-end analysis must complete in under 5 seconds[cite: 426]. | Pending |
| **NFR2** | Clean UI | [cite_start]The interface should be minimalist and intuitive (React Component Best Practices)[cite: 427]. | Pending |

## 3. UX Polish (Could Have)
**Priority:** Low - *Add these if time permits before the final deadline.*

| ID | Feature Name | Description | Status |
| :--- | :--- | :--- | :--- |
| **FR3** | Loading State | [cite_start]A visual spinner or message ("Analysing...") while the Python script runs[cite: 413]. | Pending |
| **NFR4** | Mobile Layout | [cite_start]Responsive CSS media queries to ensure the site works on mobile devices[cite: 429]. | Pending |