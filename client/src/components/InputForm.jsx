/**
 * InputForm Component (FR1, FR2)
 * Text area for financial goals + Analyse button
 */

import { useState } from 'react';
import './InputForm.css';

function InputForm({ onSubmit, isLoading }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text.trim());
        }
    };

    return (
        <div className="input-form-container">
            <div className="input-form-header">
                <h1>Risk Profile Advisor</h1>
                <p className="subtitle">
                    Tell us about your financial goals and we'll recommend an investment strategy tailored to you.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="input-form">
                <label htmlFor="goals-input" className="input-label">
                    Describe your financial goals, risk tolerance, and time horizon:
                </label>

                <textarea
                    id="goals-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="For example: I'm saving for retirement in about 20 years. I'm comfortable with some market ups and downs if it means better long-term growth. I want a balanced approach that doesn't make me too anxious..."
                    rows={6}
                    className="goals-textarea"
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    className="analyse-button"
                    disabled={!text.trim() || isLoading}
                >
                    {isLoading ? 'Analysing...' : 'Analyse My Profile'}
                </button>
            </form>
        </div>
    );
}

export default InputForm;
