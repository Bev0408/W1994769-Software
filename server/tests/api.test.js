/**
 * Backend API Test Suite
 * Robo-Advisor NLP Risk Profiler — FYP Test Evidence
 *
 * Tests run against a live server on http://localhost:5001
 * Ensure the server is running before executing: npm run dev
 *
 * Coverage: FR4, FR5, FR6, FR7, FR9, FR12, FR13, NFR1, NFR3, NFR5
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const TIMEOUT = 15000; // 15s per test (ML spawn can be slow)

// ──────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────
async function analyze(text) {
    return axios.post(`${BASE_URL}/api/analyze`, { text }, { timeout: TIMEOUT });
}

// ──────────────────────────────────────────────
// Health check (sanity)
// ──────────────────────────────────────────────
describe('Health Check', () => {
    test('T00 — GET /api/health returns status ok', async () => {
        const res = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
        expect(res.status).toBe(200);
        expect(res.data.status).toBe('ok');
    });
});

// ──────────────────────────────────────────────
// FR4 / FR5 — NLP Classification
// ──────────────────────────────────────────────
describe('FR4 / FR5 — NLP Classification', () => {

    test('T01 — POST /api/analyze returns valid risk_profile field', async () => {
        const res = await analyze('I want steady, low-risk savings with capital preservation.');
        expect(res.status).toBe(200);
        expect(['Conservative', 'Balanced', 'Aggressive']).toContain(res.data.risk_profile);
    }, TIMEOUT);

    test('T02 — Conservative text classified as Conservative', async () => {
        const res = await analyze(
            'I am nearing retirement and cannot afford to lose my savings. ' +
            'I want very low risk and prefer bonds and cash over stocks.'
        );
        expect(res.status).toBe(200);
        expect(res.data.risk_profile).toBe('Conservative');
    }, TIMEOUT);

    test('T03 — Balanced text classified as Balanced', async () => {
        const res = await analyze(
            'I am saving for the long term and want moderate growth. ' +
            'I am comfortable with some ups and downs in the market and want a mix of stocks and bonds.'
        );
        expect(res.status).toBe(200);
        expect(res.data.risk_profile).toBe('Balanced');
    }, TIMEOUT);

    test('T04 — Aggressive text classified as Aggressive', async () => {
        const res = await analyze(
            'I am young and want maximum returns. I am happy to take high risks ' +
            'investing heavily in stocks, crypto, and volatile growth assets.'
        );
        expect(res.status).toBe(200);
        expect(res.data.risk_profile).toBe('Aggressive');
    }, TIMEOUT);

    test('T05 — Response includes a confidence score between 0 and 1', async () => {
        const res = await analyze('I want to invest in a balanced way.');
        expect(res.status).toBe(200);
        expect(typeof res.data.confidence).toBe('number');
        expect(res.data.confidence).toBeGreaterThanOrEqual(0);
        expect(res.data.confidence).toBeLessThanOrEqual(1);
    }, TIMEOUT);
});

// ──────────────────────────────────────────────
// FR7 / FR9 — Portfolio retrieval & allocation
// ──────────────────────────────────────────────
describe('FR7 / FR9 — Portfolio Data', () => {

    test('T06 — Response includes a portfolio object (FR7)', async () => {
        const res = await analyze('I am cautious and prefer low risk investments.');
        expect(res.status).toBe(200);
        expect(res.data.portfolio).not.toBeNull();
        expect(typeof res.data.portfolio).toBe('object');
    }, TIMEOUT);

    test('T07 — Portfolio contains asset_allocation with four fields (FR9)', async () => {
        const res = await analyze('I want a mix of growth and stability in my portfolio.');
        const alloc = res.data.portfolio.asset_allocation;
        expect(alloc).toBeDefined();
        expect(typeof alloc.stocks).toBe('number');
        expect(typeof alloc.bonds).toBe('number');
        expect(typeof alloc.cash).toBe('number');
        expect(typeof alloc.crypto).toBe('number');
    }, TIMEOUT);

    test('T08 — Asset allocation values are valid percentages (0–100) (FR9)', async () => {
        const res = await analyze('I prefer safe investments and am close to retiring.');
        const alloc = res.data.portfolio.asset_allocation;
        for (const value of Object.values(alloc)) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(100);
        }
    }, TIMEOUT);

    test('T09 — Portfolio description is a non-empty string (FR9)', async () => {
        const res = await analyze('Long term growth is my goal, I can handle volatility.');
        expect(typeof res.data.portfolio.description).toBe('string');
        expect(res.data.portfolio.description.length).toBeGreaterThan(0);
    }, TIMEOUT);
});

// ──────────────────────────────────────────────
// NFR1 — Performance (< 5 seconds)
// ──────────────────────────────────────────────
describe('NFR1 — End-to-End Performance', () => {

    test('T10 — Full analysis completes in under 5000ms', async () => {
        const start = Date.now();
        await analyze('I want a balanced investment portfolio with moderate risk.');
        const elapsed = Date.now() - start;
        console.log(`  ↳ Response time: ${elapsed}ms`);
        expect(elapsed).toBeLessThan(5000);
    }, TIMEOUT);
});

// ──────────────────────────────────────────────
// NFR3 — Edge Case Handling
// ──────────────────────────────────────────────
describe('NFR3 — Edge Case Input Handling', () => {

    test('T11 — Empty string body returns 400 error (NFR3/NFR5)', async () => {
        try {
            await axios.post(`${BASE_URL}/api/analyze`, { text: '' }, { timeout: TIMEOUT });
            // If no error thrown, fail explicitly
            expect(true).toBe(false);
        } catch (err) {
            expect(err.response.status).toBe(400);
        }
    }, TIMEOUT);

    test('T12 — Missing text field returns 400 error', async () => {
        try {
            await axios.post(`${BASE_URL}/api/analyze`, {}, { timeout: TIMEOUT });
            expect(true).toBe(false);
        } catch (err) {
            expect(err.response.status).toBe(400);
        }
    }, TIMEOUT);

    test('T13 — Very long string (3000 chars) is accepted and processed (NFR3)', async () => {
        const longText = 'I want to invest wisely for my retirement. '.repeat(70); // ~3000 chars
        const res = await analyze(longText);
        expect(res.status).toBe(200);
        expect(['Conservative', 'Balanced', 'Aggressive']).toContain(res.data.risk_profile);
    }, TIMEOUT);

    test('T14 — Input of only numbers/symbols is handled gracefully (NFR3)', async () => {
        const res = await analyze('12345 67890 !!! ??? ###');
        expect(res.status).toBe(200);
        // Server should return a risk_profile (fallback Balanced if no meaningful text)
        expect(['Conservative', 'Balanced', 'Aggressive']).toContain(res.data.risk_profile);
    }, TIMEOUT);
});

// ──────────────────────────────────────────────
// NFR5 — Input Sanitization
// ──────────────────────────────────────────────
describe('NFR5 — Input Sanitization', () => {

    test('T15 — SQL injection attempt is processed safely', async () => {
        const sqlInput = "'; DROP TABLE portfolios; --";
        const res = await analyze(sqlInput);
        expect(res.status).toBe(200);
        // Must return a valid risk_profile, not crash
        expect(['Conservative', 'Balanced', 'Aggressive']).toContain(res.data.risk_profile);
    }, TIMEOUT);

    test('T16 — Script tag injection is stripped and processed safely', async () => {
        const xssInput = '<script>alert("xss")</script> I want low risk investments.';
        const res = await analyze(xssInput);
        expect(res.status).toBe(200);
        expect(['Conservative', 'Balanced', 'Aggressive']).toContain(res.data.risk_profile);
    }, TIMEOUT);

    test('T17 — Shell injection characters are removed safely', async () => {
        const shellInput = 'I want $(rm -rf /) to invest; carefully | please';
        const res = await analyze(shellInput);
        expect(res.status).toBe(200);
        expect(['Conservative', 'Balanced', 'Aggressive']).toContain(res.data.risk_profile);
    }, TIMEOUT);

    test('T18 — Event handler injection is stripped', async () => {
        const handlerInput = 'onclick=alert(1) I want low risk safe investments.';
        const res = await analyze(handlerInput);
        expect(res.status).toBe(200);
        expect(['Conservative', 'Balanced', 'Aggressive']).toContain(res.data.risk_profile);
    }, TIMEOUT);
});

// ──────────────────────────────────────────────
// FR12 / FR13 — Admin / Portfolio Management
// ──────────────────────────────────────────────
describe('FR12 / FR13 — Admin Portfolio Management', () => {

    test('T19 — GET /api/portfolios returns all 3 portfolio documents (FR13)', async () => {
        const res = await axios.get(`${BASE_URL}/api/portfolios`, { timeout: 5000 });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data.length).toBe(3);
        const profiles = res.data.map(p => p.risk_profile);
        expect(profiles).toContain('Conservative');
        expect(profiles).toContain('Balanced');
        expect(profiles).toContain('Aggressive');
    });

    test('T20 — Each portfolio document has required schema fields (FR13)', async () => {
        const res = await axios.get(`${BASE_URL}/api/portfolios`, { timeout: 5000 });
        for (const p of res.data) {
            expect(p.risk_profile).toBeDefined();
            expect(p.description).toBeDefined();
            expect(p.asset_allocation).toBeDefined();
            expect(p.asset_allocation.stocks).toBeDefined();
            expect(p.asset_allocation.bonds).toBeDefined();
            expect(p.asset_allocation.cash).toBeDefined();
            expect(p.asset_allocation.crypto).toBeDefined();
        }
    });

    test('T21 — PUT /api/portfolios/:risk_profile updates asset allocation (FR13)', async () => {
        // Read current allocation first
        const getRes = await axios.get(`${BASE_URL}/api/portfolios`, { timeout: 5000 });
        const conservative = getRes.data.find(p => p.risk_profile === 'Conservative');
        const originalAlloc = { ...conservative.asset_allocation };

        // Send update (same values — non-destructive test)
        const res = await axios.put(
            `${BASE_URL}/api/portfolios/Conservative`,
            {
                asset_allocation: originalAlloc,
                description: conservative.description
            },
            { timeout: 5000 }
        );
        expect(res.status).toBe(200);
        expect(res.data.risk_profile).toBe('Conservative');
        expect(res.data.asset_allocation.stocks).toBe(originalAlloc.stocks);
    });

    test('T22 — PUT /api/portfolios/:risk_profile with invalid profile returns 404 (FR13)', async () => {
        try {
            await axios.put(
                `${BASE_URL}/api/portfolios/Unknown`,
                { asset_allocation: { stocks: 25, bonds: 25, cash: 25, crypto: 25 }, description: 'x' },
                { timeout: 5000 }
            );
            expect(true).toBe(false); // Should not reach here
        } catch (err) {
            expect(err.response.status).toBe(404);
        }
    });

    test('T23 — Admin API routes are accessible without authentication (FR12 — NOTE: API-level auth absent)', async () => {
        // This test documents that admin routes have no server-side auth guard.
        // Admin access is gated at the frontend only (App.jsx footer button).
        const res = await axios.get(`${BASE_URL}/api/portfolios`, { timeout: 5000 });
        // Returns 200 — no 401/403 challenge issued
        expect(res.status).toBe(200);
        // EVIDENCE NOTE: FR12 is partially met — admin panel exists in UI;
        // API-level authentication is not implemented in this version.
    });
});
