/**
 * Portfolio Model - Mongoose Schema
 * Stores model portfolio definitions per risk profile
 * See: Data Schema.md
 */

const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  risk_profile: {
    type: String,
    required: true,
    enum: ['Conservative', 'Balanced', 'Aggressive'],
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  asset_allocation: {
    stocks: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    bonds: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    cash: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    crypto: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  visualisation_color: {
    type: String,
    default: '#4CAF50'
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
