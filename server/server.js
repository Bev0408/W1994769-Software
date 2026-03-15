/**
 * Robo-Advisor Backend Server
 * Node.js + Express REST API
 * Handles text analysis by spawning Python ML process
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');

const Portfolio = require('./models/Portfolio');

const app = express();
const PORT = process.env.PORT || 5000;

// Cross-platform Python command (mac/linux: python3, windows: python)
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

// Middleware
app.use(express.json());

// CORS - Allow React frontend (Vite default port)
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
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

/**
 * Run Python prediction script
 * Returns Promise with classification result
 */
function runPrediction(text) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'ml_service', 'scripts', 'predict.py');

        const pythonProcess = spawn(pythonCmd, [scriptPath, text]);

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python stderr:', stderr);
                // Fallback classification (NFR3)
                resolve({
                    risk_profile: 'Balanced',
                    confidence: 0.33,
                    error: 'Classification process failed'
                });
            } else {
                try {
                    const result = JSON.parse(stdout.trim());
                    resolve(result);
                } catch (e) {
                    // Fallback if JSON parsing fails (NFR3)
                    resolve({
                        risk_profile: 'Balanced',
                        confidence: 0.33,
                        error: 'Failed to parse classification result'
                    });
                }
            }
        });

        pythonProcess.on('error', (err) => {
            console.error('Failed to start Python process:', err);
            // Fallback (NFR3)
            resolve({
                risk_profile: 'Balanced',
                confidence: 0.33,
                error: 'Failed to start classification process'
            });
        });
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

        // Get classification from Python
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
 * Returns all model portfolios (for admin/debugging)
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
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================
// Serve React Frontend (Production)
// ========================

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route - serve React app for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ========================
// Database Connection & Server Start
// ========================

async function startServer() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/robo-advisor';

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
            console.log(`✓ CORS enabled for http://localhost:5173`);
        });

    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
