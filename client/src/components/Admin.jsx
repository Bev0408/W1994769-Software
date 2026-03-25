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

    const handleSave = async (portfolio, index) => {
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
