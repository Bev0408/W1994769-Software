/**
 * API Service - Axios client for backend calls
 */

import axios from 'axios';

// In production (Render), use relative URL. In development, use localhost.
const API_BASE_URL = import.meta.env.PROD
    ? '/api'
    : 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Analyze user's financial goals text
 * @param {string} text - User's financial goals description
 * @returns {Promise<Object>} Classification result with portfolio
 */
export async function analyzeText(text) {
    try {
        const response = await api.post('/analyze', { text });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error(error.response?.data?.error || 'Failed to analyze text');
    }
}

