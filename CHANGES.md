# Additional Changes & Enhancements

This document summarises all changes and additions made beyond the original functional and non-functional requirements.

---

## UI/UX Enhancements

### Professional UI Overhaul
- **Header bar** — Added a slim navigation bar at the top with the app name and frosted glass effect (`backdrop-filter: blur`)
- **Purple gradient background** — Replaced the flat grey Vite default with a rich purple gradient (`#667eea` to `#764ba2`) matching the app's brand colours
- **White card design** — Input form and results page are wrapped in elevated white cards with rounded corners and drop shadows, giving the app a modern fintech look
- **Full-width footer** — Fixed the footer to span the entire page width with semi-transparent dark background
- **Vite default cleanup** — Removed conflicting dark theme CSS from `index.css` that was causing colour inconsistencies

### Response Time Display (NFR1 Evidence)
- Added a timer that records `Date.now()` before and after each API call
- Displays "Analysis completed in X.XXs" on the results page
- Provides concrete, visible evidence that the system meets the NFR1 performance target (< 5 seconds)

---

## Model Evaluation Dashboard

### F1 Score & Confusion Matrix Visualisation
- **`evaluate.py`** — New Python script that loads the trained SVM model, recreates the same 80/20 stratified test split (random_state=42), and computes the weighted F1 score and confusion matrix, outputting results as JSON
- **`GET /api/evaluation`** — New backend endpoint that spawns `evaluate.py` and returns the evaluation metrics
- **Admin panel integration** — The evaluation section displays:
  - Weighted F1 score as a large number with a green/red pass/fail badge against the 70% target
  - Test set size (100 samples from a 20% held-out set)
  - Colour-coded confusion matrix table (green diagonal = correct predictions, red = misclassifications)
  - Row/column labels explaining Actual vs Predicted

This was implemented based on supervisor feedback to demonstrate model reliability and align with the evaluation criteria.

---

## Code Quality Fixes

### Validation
- **Asset allocation sum check** — Admin panel now validates that stocks + bonds + cash + crypto = 100% before allowing a save. Displays an error message with the current total if invalid.

### Error Handling
- **Evaluation endpoint error handler** — Added `process.on('error')` handler to the `/api/evaluation` endpoint to prevent hanging requests if the Python process fails to spawn (matching the pattern already used in `/api/analyze`)

### Cleanup
- **Removed dead code** — Deleted unused `getPortfolios()` and `healthCheck()` exports from `analyze.js` (Admin component calls the API directly via `fetch`)
- **Removed Vite CSS defaults** — Stripped dark theme colour scheme, button styles, link styles, and `h1` sizing from `index.css` that conflicted with the app's own styles
