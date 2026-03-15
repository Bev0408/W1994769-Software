/**
 * Database Seed Script
 * Populates MongoDB with initial model portfolios
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Portfolio = require('./models/Portfolio');

const portfolios = [
    {
        risk_profile: 'Conservative',
        description: 'Designed for capital preservation with minimal volatility. Ideal for near-term goals (1-3 years) or risk-averse investors approaching retirement.',
        asset_allocation: {
            stocks: 20,
            bonds: 50,
            cash: 25,
            crypto: 5
        },
        visualisation_color: '#4CAF50'  // Green
    },
    {
        risk_profile: 'Balanced',
        description: 'A diversified mix targeting moderate growth with manageable risk. Suitable for medium-term goals (5-10 years) like university fees or home deposits.',
        asset_allocation: {
            stocks: 50,
            bonds: 30,
            cash: 15,
            crypto: 5
        },
        visualisation_color: '#2196F3'  // Blue
    },
    {
        risk_profile: 'Aggressive',
        description: 'Designed for maximum growth over a long time horizon (10+ years). High volatility expected but potential for significant returns.',
        asset_allocation: {
            stocks: 70,
            bonds: 10,
            cash: 5,
            crypto: 15
        },
        visualisation_color: '#FF5733'  // Orange-Red
    }
];

async function seed() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/robo-advisor';

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✓ Connected');

        // Clear existing portfolios
        await Portfolio.deleteMany({});
        console.log('✓ Cleared existing portfolios');

        // Insert new portfolios
        await Portfolio.insertMany(portfolios);
        console.log('✓ Inserted 3 model portfolios:');

        portfolios.forEach(p => {
            console.log(`  - ${p.risk_profile}: ${p.asset_allocation.stocks}% stocks, ${p.asset_allocation.bonds}% bonds, ${p.asset_allocation.cash}% cash, ${p.asset_allocation.crypto}% crypto`);
        });

        await mongoose.connection.close();
        console.log('\n✓ Database seeded successfully!');

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
