/**
 * Robo-Advisor Backend Server (Render Deployment Version)
 * Pure JavaScript - NO Python dependencies
 * Returns hardcoded classification for demo purposes
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const Portfolio = require('./models/Portfolio');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// ========================
// API Routes
// ========================

/**
 * POST /api/analyze
 * Returns hardcoded Aggressive profile for demo
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                error: 'Text input is required'
            });
        }

        // Hardcoded response for Render deployment
        const risk_profile = 'Aggressive';

        // Try to fetch portfolio from database
        let portfolio = null;
        try {
            portfolio = await Portfolio.findOne({ risk_profile });
        } catch (dbErr) {
            console.log('Database not connected, using hardcoded portfolio');
        }

        // Return result with hardcoded or DB portfolio
        res.json({
            risk_profile: risk_profile,
            confidence: 0.95,
            portfolio: portfolio ? {
                description: portfolio.description,
                asset_allocation: portfolio.asset_allocation,
                visualisation_color: portfolio.visualisation_color
            } : {
                description: 'High growth strategy for long-term investors.',
                asset_allocation: {
                    stocks: 70,
                    bonds: 10,
                    cash: 5,
                    crypto: 15
                },
                visualisation_color: '#FF5733'
            }
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
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================
// Serve React Frontend
// ========================

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ========================
// Start Server
// ========================

async function startServer() {
    // Try to connect to MongoDB (optional for this demo version)
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
        try {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(mongoUri);
            console.log('✓ Connected to MongoDB');
        } catch (error) {
            console.log('⚠ MongoDB connection failed, continuing without database');
        }
    }

    app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log('✓ Using hardcoded Aggressive profile (Render mode)');
    });
}

startServer();
