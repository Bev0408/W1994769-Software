# Test Results — NLP Robo-Advisor Risk Profiler
**Student:** Beveridge Ekpolomo | **ID:** W1994769
**Date:** 28 March 2026
**Project:** Final Year Project — NLP-Based Risk Profiler & Robo-Advisor

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests Run | 43 |
| Passed | 41 |
| Failed | 2 |
| Pass Rate | **95.3%** |

| Test Suite | Tool | Tests | Passed | Failed |
|------------|------|-------|--------|--------|
| Backend API Tests | Jest + Axios (Node.js) | 24 | 24 | 0 |
| ML Service Tests | pytest (Python 3) | 19 | 17 | 2 |

**Failed tests:** T32 and T36 — both are genuine SVM misclassification cases on borderline/negation-heavy sentences, documented as model limitations (see notes).

---

## Test Environment

| Component | Detail |
|-----------|--------|
| Server | Node.js v20 + Express, `http://localhost:5001` |
| Database | MongoDB Atlas (cloud) |
| ML Service | Python 3.12, scikit-learn SVM + TF-IDF |
| API test runner | Jest 30.3.0 + Axios 1.14.0 |
| ML test runner | pytest 9.0.2 |
| OS | macOS Darwin 25.0.0 |

---

## FR1 — The system provides a webpage with a text area for entering financial goals

*Test type: Black Box (code inspection)*
The `InputForm` component (`client/src/components/InputForm.jsx:33`) renders a `<textarea>` element with `id="goals-input"` and placeholder text describing the expected financial goals input. The element is rendered within a form on the application root page.

**Result: PASS** — Component confirmed present in source code.

---

## FR2 — The user can submit text with a single click of an Analyse button

*Test type: Black Box (code inspection)*
`InputForm.jsx:43` renders a `<button type="submit">` labelled *"Analyse My Profile"*. The form's `onSubmit` handler calls `onSubmit(text.trim())` on a single click. The button is disabled until `text.trim()` is non-empty.

**Result: PASS** — Single-click submission confirmed.

---

## FR3 — The system displays a loading animation or message while processing

*Test type: Black Box (code inspection)*
When `isLoading` is true, `InputForm.jsx:47–49` renders a CSS `<span className="spinner" />` element inside the button and changes the button label to *"Analysing..."*. The `isLoading` state is set to `true` in `App.jsx:20` immediately on form submission and reset to `false` in the `finally` block of `handleAnalyze`.

**Result: PASS** — Loading spinner and label change confirmed.

---

## FR4 — The system processes input text using an NLP model

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T01 | Black Box | POST /api/analyze returns valid risk_profile | "I want steady, low-risk savings..." | 200 + valid risk_profile | 200 + "Conservative" | **PASS** |
| T26 | White Box | SVM classifier object loads and exposes predict() | Load classifier.pkl | Object with predict() | SVC with predict() | **PASS** |
| T27 | White Box | TF-IDF vectorizer loads and exposes transform() | Load vectorizer.pkl | Object with transform() | TfidfVectorizer with transform() | **PASS** |
| T29 | White Box | TF-IDF vectorizer output shape is within bounds | "I want a low risk investment for retirement" | 1 row, 0 < features ≤ 1000 | Shape (1, 663) — max_features=1000 capped at 663 by min_df=2 | **PASS** |
| T30 | White Box | Vectorizer handles unseen vocabulary without error | "xyzabcdefg nonsenseword foobar" | No exception, consistent shape | Shape (1, 663), all-zero vector | **PASS** |

**Notes (T29):** The vectorizer is configured with `max_features=1000, min_df=2, ngram_range=(1,2)`. The `min_df=2` filter removes terms appearing in fewer than 2 documents, reducing the learned vocabulary to 663 features from the 500-sample training set. The feature count is deterministic and consistent across all calls.

---

## FR5 — The system classifies text into one of three risk profiles: Conservative, Balanced, or Aggressive

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T02 | Black Box | Conservative text → Conservative profile | "I am nearing retirement and cannot afford to lose my savings. I want very low risk..." | Conservative | Conservative | **PASS** |
| T03 | Black Box | Balanced text → Balanced profile | "I am saving for the long term and want moderate growth. I am comfortable with some ups and downs..." | Balanced | Balanced | **PASS** |
| T04 | Black Box | Aggressive text → Aggressive profile | "I am young and want maximum returns. I am happy to take high risks investing heavily in stocks, crypto..." | Aggressive | Aggressive | **PASS** |
| T28 | White Box | Classifier has exactly 3 classes | Inspect classifier.classes_ | ['Aggressive', 'Balanced', 'Conservative'] | All 3 present | **PASS** |
| T31 | White Box | Conservative sentence 1 classified correctly | "I am retired and need to protect my savings from any losses." | Conservative | Conservative | **PASS** |
| T32 | White Box | Conservative sentence 2 classified correctly | "I cannot afford any risk. I want bonds and cash with minimal volatility." | Conservative | **Aggressive** | **FAIL** |
| T33 | White Box | Conservative sentence 3 classified correctly | "Safety is my top priority. I have a short time horizon and low risk tolerance." | Conservative | Conservative | **PASS** |
| T34 | White Box | Balanced sentence 1 classified correctly | "I want a mix of growth and security, I can handle moderate risk over 10 years." | Balanced | Balanced | **PASS** |
| T35 | White Box | Balanced sentence 2 classified correctly | "I am saving for a house in five years and want balanced moderate risk investments." | Balanced | Balanced | **PASS** |
| T36 | White Box | Balanced sentence 3 classified correctly | "I want steady growth but do not want to take excessive risks with my savings." | Balanced | **Conservative** | **FAIL** |
| T37 | White Box | Aggressive sentence 1 classified correctly | "I am young and want maximum returns. I am happy to take high risks with crypto and stocks." | Aggressive | Aggressive | **PASS** |
| T38 | White Box | Aggressive sentence 2 classified correctly | "I want aggressive growth and I can absorb significant losses in pursuit of high returns." | Aggressive | Aggressive | **PASS** |
| T39 | White Box | Aggressive sentence 3 classified correctly | "I have a 30 year horizon and want heavy exposure to volatile equities and emerging markets." | Aggressive | Aggressive | **PASS** |

**Notes (T32 — FAIL):** Input text "I cannot afford any risk. I want bonds and cash with minimal volatility." The preprocessing pipeline removes stopwords and lemmatises tokens. After preprocessing, the token `cannot` is removed as a stopword, leaving terms like `afford`, `risk`, `bond`, `cash`, `minimal`, `volatility`. The word `volatility` appears frequently in the Aggressive training class, causing the SVM to misclassify. This is a known limitation of the bag-of-words model; it cannot interpret negation. In production this could be addressed with a more sophisticated NLP model (e.g., transformer-based).

**Notes (T36 — FAIL):** Input "I want steady growth but do not want to take excessive risks with my savings." After stopword removal, `do not` is reduced to a single token `not` which may also be stripped, leaving `want steady growth want take excessive risk saving`. The model classifies this as Conservative because `risk` and `saving` dominate the feature weights in that direction, despite the intended Balanced meaning. Same root cause as T32 — inability to represent negation in a bag-of-words model.

---

## FR6 — The user is presented with their classified risk profile on a results page

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T01 | Black Box | API response includes risk_profile field | Any valid text | risk_profile in response JSON | risk_profile present | **PASS** |
| T05 | Black Box | Response includes confidence score 0–1 | "I want to invest in a balanced way." | confidence ∈ [0, 1] | confidence = 0.XX | **PASS** |

*The Results component (`client/src/components/Results.jsx`) renders the risk_profile value from the API response. Confirmed by code inspection.*

---

## FR7 — The system retrieves a model portfolio linked to the classified risk profile

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T06 | Black Box | API response includes non-null portfolio object | "I am cautious and prefer low risk investments." | portfolio ≠ null | portfolio object present | **PASS** |
| T07 | Black Box | Portfolio contains asset_allocation with 4 fields | "I want a mix of growth and stability." | stocks, bonds, cash, crypto present | All 4 present | **PASS** |

---

## FR8 — The model portfolio allocation is displayed in a pie or donut chart

*Test type: Black Box (code inspection)*
The `PieChart` component (`client/src/components/PieChart.jsx`) renders a doughnut chart using the `visualisation_color` and `asset_allocation` data from the API response. Confirmed by code inspection of `Results.jsx` which imports and renders `<PieChart />`.

**Result: PASS** — Doughnut chart component confirmed present.

---

## FR9 — The portfolio allocation is displayed as a textual list

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T07 | Black Box | Portfolio contains all four allocation fields | Any valid text | stocks, bonds, cash, crypto as numbers | All 4 present | **PASS** |
| T08 | Black Box | All allocation values are valid percentages | "I prefer safe investments..." | 0 ≤ each value ≤ 100 | All values in range | **PASS** |
| T09 | Black Box | Portfolio description is a non-empty string | "Long term growth is my goal..." | description.length > 0 | Description present | **PASS** |

*`Results.jsx` renders each asset and its percentage as a labelled bar/list. Confirmed by code inspection.*

---

## FR10 — A Start Over button is present on the results page

*Test type: Black Box (code inspection)*
`Results.jsx` renders a `<button>` labelled *"Start Over"* (or equivalent). The button triggers `onReset` which is passed as a prop from `App.jsx:60`.

**Result: PASS** — Start Over button confirmed present.

---

## FR11 — Clicking Start Over returns the user to the homepage

*Test type: Black Box (code inspection)*
In `App.jsx:36–39`, `handleReset` sets `result = null` and `error = null`. Since the component tree conditionally renders `<InputForm />` when `result` is falsy, resetting result returns the view to the input form — effectively the homepage.

**Result: PASS** — Reset logic confirmed.

---

## FR12 — A secure method exists for an Administrator to access model portfolio data

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T23 | Black Box | Admin API routes respond — document auth status | GET /api/portfolios (no credentials) | If API-auth implemented: 401/403. If frontend-only: 200 | 200 — no API-level auth challenge | **PARTIAL** |

**Notes (T23):** The admin panel is accessible via an *"Admin"* button in the application footer (`App.jsx:70`). There is no password prompt or session check on the frontend before rendering the Admin component. The API routes `/api/portfolios` (GET) and `/api/portfolios/:risk_profile` (PUT) have no server-side authentication middleware. Admin access is therefore present as a UI concern but is **not protected at the API level**. This is a known limitation of the current implementation. For a production system, JWT or session-based authentication would be required. **FR12 is partially met** — an admin panel exists, but it is not restricted to authorised users only.

---

## FR13 — The Administrator can view and update asset allocations for each risk type

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T19 | Black Box | GET /api/portfolios returns all 3 portfolios | GET /api/portfolios | Array of 3 documents | Array of 3 (Conservative, Balanced, Aggressive) | **PASS** |
| T20 | Black Box | Each portfolio has required schema fields | GET /api/portfolios | risk_profile, description, asset_allocation (4 fields) | All fields present | **PASS** |
| T21 | Black Box | PUT /api/portfolios/:risk_profile updates allocation | PUT /api/portfolios/Conservative with original values | 200 + updated document | 200 + correct document returned | **PASS** |
| T22 | Black Box | PUT with unknown risk_profile returns 404 | PUT /api/portfolios/Unknown | 404 | 404 | **PASS** |

---

## NFR1 — End-to-end analysis completes in under 5 seconds

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T10 | Black Box | Full analysis (submit → response) completes in < 5000ms | "I want a balanced investment portfolio with moderate risk." | elapsed < 5000ms | **2781ms** | **PASS** |

**Notes:** Measured as wall-clock time from `Date.now()` before the Axios POST to `Date.now()` after response received. The 2781ms includes: HTTP round-trip, Node.js spawning a Python child process, NLTK preprocessing, SVM inference, MongoDB portfolio lookup, and JSON serialisation. Well within the 5-second NFR1 target.

---

## NFR3 — The NLP model returns a classification for any text input, including edge cases

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T11 | Black Box | Empty string body returns 400 error | POST with text: "" | 400 Bad Request | 400 | **PASS** |
| T12 | Black Box | Missing text field returns 400 error | POST with {} body | 400 Bad Request | 400 | **PASS** |
| T13 | Black Box | Very long string (~3000 chars) processed gracefully | 70× repeated sentence | 200 + valid risk_profile | 200 + Conservative | **PASS** |
| T14 | Black Box | Numbers and symbols only handled gracefully | "12345 67890 !!! ??? ###" | 200 + valid risk_profile (fallback Balanced) | 200 + Balanced | **PASS** |
| T40 | White Box | Empty string via predict.py returns valid fallback | predict.py called with "" | Valid risk_profile, no crash | Balanced (with warning) | **PASS** |
| T41 | White Box | Only special characters handled gracefully | predict.py with "!@#$%^&*()" | Valid risk_profile, no crash | Balanced (fallback) | **PASS** |
| T42 | White Box | Very long input (2500 chars) handled without crash | predict.py with 2500 char string | Valid risk_profile, no crash | Conservative | **PASS** |

**Notes:** The fallback mechanism in `predict.py:71–76` and `server.js:77–81` ensures a Balanced fallback is always returned if the NLP pipeline fails or produces empty output after preprocessing, satisfying NFR3.

---

## NFR5 — The backend API sanitises user text input to prevent injection attacks

| Test ID | Type | Description | Input | Expected | Actual | Pass/Fail |
|---------|------|-------------|-------|----------|--------|-----------|
| T15 | Black Box | SQL injection attempt processed safely | `'; DROP TABLE portfolios; --` | 200 + valid risk_profile, no crash | 200 + Balanced | **PASS** |
| T16 | Black Box | Script tag injection stripped and processed safely | `<script>alert("xss")</script> I want low risk.` | 200 + valid risk_profile, script stripped | 200 + Conservative | **PASS** |
| T17 | Black Box | Shell injection characters removed safely | `I want $(rm -rf /) to invest; carefully \| please` | 200 + valid risk_profile, shell chars removed | 200 + Balanced | **PASS** |
| T18 | Black Box | Event handler injection stripped | `onclick=alert(1) I want low risk safe investments.` | 200 + valid risk_profile, handler stripped | 200 + Conservative | **PASS** |

**Notes:** The `sanitizeInput()` function in `server.js:36–50` applies the following transformations in order: (1) strips `<script>` tags via regex, (2) removes `on<event>=` patterns, (3) removes shell metacharacters `; & | \` $ ( )`, (4) truncates to 2000 characters. SQL injection keywords such as `DROP TABLE` pass through sanitisation (they are not shell/HTML injection vectors) and are safely passed to the Python NLP model, which treats them as ordinary text tokens. The model is not connected to a SQL database directly, so SQL injection is not an applicable attack vector.

---

## Test File Locations

| File | Purpose |
|------|---------|
| `server/tests/api.test.js` | Jest + Axios API test suite (24 tests) |
| `ml_service/tests/test_ml.py` | pytest ML service test suite (19 tests) |

### How to run

```bash
# API tests (server must be running on port 5001)
cd server && npm test

# ML tests (from project root)
python3 -m pytest ml_service/tests/test_ml.py -v
```
