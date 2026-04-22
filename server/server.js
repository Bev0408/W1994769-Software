/**
 * Robo-Advisor Backend Server
 * Node.js + Express REST API
 * Handles text analysis via a persistent Python ML worker process
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const Portfolio = require('./models/Portfolio');

const app = express();
const PORT = process.env.PORT || 5000;

// Cross-platform Python command (mac/linux: python3, windows: python)
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

// Middleware
app.use(express.json());

// CORS - Allow React frontend (dev: Vite port, prod: same origin)
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? true  // Client served from same server in production — allow all
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type']
}));

/**
 * Input Sanitization (NFR5)
 * Removes potentially dangerous characters/patterns
 */
function sanitizeInput(text) {
    if (typeof text !== 'string') return '';

    // Remove script tags and event handlers
    let clean = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    clean = clean.replace(/on\w+\s*=/gi, '');

    // Remove shell injection patterns
    clean = clean.replace(/[;&|`$()]/g, '');

    // Limit length to prevent DoS
    clean = clean.substring(0, 2000);

    return clean.trim();
}

// ========================
// Persistent Python Worker
// ========================
// One Python process is started when the server starts.
// All classification requests are sent via stdin and results read from stdout.
// This avoids the 5-10 second Python startup cost on every request.

let pyWorker = null;
const resolverQueue = []; // FIFO queue of pending resolve functions
let lineBuffer = '';

function startPythonWorker() {
    const scriptPath = path.join(__dirname, '..', 'ml_service', 'scripts', 'predict.py');
    pyWorker = spawn(pythonCmd, [scriptPath, '--stdin']);
    lineBuffer = '';

    pyWorker.stdout.on('data', (data) => {
        lineBuffer += data.toString();
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop(); // keep any incomplete trailing line

        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const parsed = JSON.parse(line.trim());
                // Skip the startup ready signal — not a prediction result
                if (parsed.ready) continue;
                if (resolverQueue.length > 0) {
                    resolverQueue.shift()(parsed);
                }
            } catch (_) { /* malformed line, skip */ }
        }
    });

    pyWorker.stderr.on('data', (data) => {
        console.error('Python worker stderr:', data.toString());
    });

    pyWorker.on('close', () => {
        console.log('Python worker closed, will restart on next request');
        pyWorker = null;
        lineBuffer = '';
        // Resolve any pending requests with NFR3 fallback
        while (resolverQueue.length) {
            resolverQueue.shift()({ risk_profile: 'Balanced', confidence: 0.33, error: 'Worker restarting' });
        }
    });

    pyWorker.on('error', (err) => {
        console.error('Failed to start Python worker:', err);
        pyWorker = null;
    });
}

function runPrediction(text) {
    return new Promise((resolve) => {
        // Restart worker if it has died
        if (!pyWorker) startPythonWorker();
        resolverQueue.push(resolve);
        pyWorker.stdin.write(text + '\n');
    });
}

// ========================
// API Routes
// ========================

/**
 * POST /api/analyze
 * Main endpoint - analyzes text and returns risk profile + portfolio
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        // Validate input
        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                error: 'Text input is required'
            });
        }

        // Sanitize input (NFR5)
        const sanitizedText = sanitizeInput(text);

        if (!sanitizedText) {
            return res.status(400).json({
                error: 'Invalid input after sanitization'
            });
        }

        // Get classification from persistent Python worker
        const classification = await runPrediction(sanitizedText);

        // Fetch portfolio from database
        const portfolio = await Portfolio.findOne({
            risk_profile: classification.risk_profile
        });

        // Return combined result
        res.json({
            risk_profile: classification.risk_profile,
            confidence: classification.confidence,
            portfolio: portfolio ? {
                description: portfolio.description,
                asset_allocation: portfolio.asset_allocation,
                visualisation_color: portfolio.visualisation_color
            } : null,
            warning: classification.warning || null,
            error: classification.error || null
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/portfolios
 * Returns all model portfolios
 */
app.get('/api/portfolios', async (req, res) => {
    try {
        const portfolios = await Portfolio.find({});
        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch portfolios' });
    }
});

/**
 * PUT /api/portfolios/:risk_profile
 * Update asset allocation for a given portfolio (FR13)
 */
app.put('/api/portfolios/:risk_profile', async (req, res) => {
    try {
        const { risk_profile } = req.params;
        const { asset_allocation, description } = req.body;

        const portfolio = await Portfolio.findOneAndUpdate(
            { risk_profile },
            { asset_allocation, description, last_updated: new Date() },
            { new: true, runValidators: true }
        );

        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }

        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update portfolio' });
    }
});

/**
 * GET /api/evaluation
 * Serves pre-computed F1 score + confusion matrix from build-time cache.
 * evaluate.py is run during the build step (render.yaml) and the result
 * saved to ml_service/models/evaluation_cache.json — no Python spawn needed.
 */
app.get('/api/evaluation', (req, res) => {
    const cachePath = path.join(__dirname, '..', 'ml_service', 'models', 'evaluation_cache.json');
    try {
        const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        res.json(data);
    } catch (_) {
        res.status(500).json({ error: 'Evaluation results not available' });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================
// Serve React Frontend (Production)
// ========================

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ========================
// Database Connection & Server Start
// ========================

async function startServer() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/robo-advisor';

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
            console.log(`✓ CORS enabled for http://localhost:5173`);

            // Start the Python worker after server is listening
            console.log('Starting Python ML worker...');
            startPythonWorker();
            console.log('✓ Python ML worker started');
        });

    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
