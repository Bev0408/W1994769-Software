/**
 * Admin Component (FR12, FR13)
 * View and update portfolio asset allocations
 */

import { useState, useEffect } from 'react';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Admin({ onClose }) {
    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [message, setMessage] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [evalLoading, setEvalLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/portfolios`)
            .then(res => res.json())
            .then(data => {
                setPortfolios(data);
                setLoading(false);
            })
            .catch(() => {
                setMessage({ type: 'error', text: 'Failed to load portfolios.' });
                setLoading(false);
            });

        fetch(`${API_BASE}/api/evaluation`)
            .then(res => res.json())
            .then(data => {
                setEvaluation(data);
                setEvalLoading(false);
            })
            .catch(() => setEvalLoading(false));
    }, []);

    const handleChange = (index, field, value) => {
        const updated = [...portfolios];
        updated[index] = {
            ...updated[index],
            asset_allocation: {
                ...updated[index].asset_allocation,
                [field]: Number(value)
            }
        };
        setPortfolios(updated);
    };

    const getTotal = (allocation) => {
        return Object.values(allocation).reduce((sum, val) => sum + val, 0);
    };

    const handleSave = async (portfolio, index) => {
        const total = getTotal(portfolio.asset_allocation);
        if (total !== 100) {
            setMessage({ type: 'error', text: `Allocations must total 100%. Currently: ${total}%` });
            return;
        }

        setSaving(index);
        setMessage(null);

        try {
            const res = await fetch(`${API_BASE}/api/portfolios/${portfolio.risk_profile}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_allocation: portfolio.asset_allocation,
                    description: portfolio.description
                })
            });

            if (!res.ok) throw new Error();
            setMessage({ type: 'success', text: `${portfolio.risk_profile} portfolio saved.` });
        } catch {
            setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Admin — Portfolio Manager</h2>
                <button className="admin-close-btn" onClick={onClose}>← Back</button>
            </div>

            {message && (
                <div className={`admin-message admin-message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Model Evaluation Section */}
            <div className="eval-section">
                <h3 className="eval-title">Model Evaluation</h3>

                {evalLoading ? (
                    <p className="admin-loading">Running evaluation...</p>
                ) : evaluation ? (
                    <>
                        <div className="eval-score-row">
                            <div className="eval-score-box">
                                <span className="eval-score-label">Weighted F1 Score</span>
                                <span className="eval-score-value">{evaluation.f1_percent}%</span>
                                <span className={`eval-badge ${evaluation.target_met ? 'eval-badge--pass' : 'eval-badge--fail'}`}>
                                    {evaluation.target_met ? 'Target Met (≥70%)' : 'Below Target (70%)'}
                                </span>
                            </div>
                            <div className="eval-score-box">
                                <span className="eval-score-label">Test Samples</span>
                                <span className="eval-score-value">{evaluation.test_size}</span>
                                <span className="eval-badge eval-badge--info">20% held-out set</span>
                            </div>
                        </div>

                        <h4 className="eval-cm-title">Confusion Matrix</h4>
                        <p className="eval-cm-desc">Rows = Actual label &nbsp;|&nbsp; Columns = Predicted label</p>
                        <div className="eval-cm-wrapper">
                            <table className="eval-cm-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        {evaluation.labels.map(l => <th key={l}>{l}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {evaluation.confusion_matrix.map((row, i) => (
                                        <tr key={i}>
                                            <td className="eval-cm-label">{evaluation.labels[i]}</td>
                                            {row.map((val, j) => (
                                                <td
                                                    key={j}
                                                    className={`eval-cm-cell ${i === j ? 'eval-cm-cell--correct' : val > 0 ? 'eval-cm-cell--wrong' : ''}`}
                                                >
                                                    {val}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <p className="admin-loading">Evaluation unavailable.</p>
                )}
            </div>

            {loading ? (
                <p className="admin-loading">Loading portfolios...</p>
            ) : (
                <div className="admin-cards">
                    {portfolios.map((portfolio, index) => (
                        <div key={portfolio.risk_profile} className="admin-card">
                            <h3 className="admin-card-title">{portfolio.risk_profile}</h3>
                            <p className="admin-card-desc">{portfolio.description}</p>

                            <div className="admin-fields">
                                {Object.entries(portfolio.asset_allocation).map(([asset, value]) => (
                                    <div key={asset} className="admin-field">
                                        <label className="admin-label">
                                            {asset.charAt(0).toUpperCase() + asset.slice(1)} (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={value}
                                            onChange={(e) => handleChange(index, asset, e.target.value)}
                                            className="admin-input"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                className="admin-save-btn"
                                onClick={() => handleSave(portfolio, index)}
                                disabled={saving === index}
                            >
                                {saving === index ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Admin;
