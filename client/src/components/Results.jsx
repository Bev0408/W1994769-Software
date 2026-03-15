/**
 * Results Component (FR6, FR9)
 * Displays risk profile and portfolio allocation
 */

import './Results.css';

function Results({ result, onReset }) {
    if (!result) return null;

    const { risk_profile, confidence, portfolio, warning, error } = result;

    const getProfileEmoji = (profile) => {
        switch (profile) {
            case 'Conservative': return '🛡️';
            case 'Balanced': return '⚖️';
            case 'Aggressive': return '🚀';
            default: return '📊';
        }
    };

    const getProfileColor = (profile) => {
        switch (profile) {
            case 'Conservative': return '#4CAF50';
            case 'Balanced': return '#2196F3';
            case 'Aggressive': return '#FF5733';
            default: return '#666';
        }
    };

    return (
        <div className="results-container">
            <div className="results-header">
                <h2>Your Risk Profile</h2>
            </div>

            {/* Risk Profile Badge */}
            <div
                className="profile-badge"
                style={{ '--profile-color': getProfileColor(risk_profile) }}
            >
                <span className="profile-emoji">{getProfileEmoji(risk_profile)}</span>
                <span className="profile-name">{risk_profile}</span>
                <span className="confidence-badge">
                    {Math.round(confidence * 100)}% confidence
                </span>
            </div>

            {/* Portfolio Description */}
            {portfolio && (
                <div className="portfolio-section">
                    <p className="portfolio-description">{portfolio.description}</p>

                    {/* Asset Allocation (FR9) */}
                    <div className="allocation-grid">
                        <h3>Recommended Asset Allocation</h3>

                        <div className="allocation-bars">
                            {Object.entries(portfolio.asset_allocation).map(([asset, percentage]) => (
                                <div key={asset} className="allocation-item">
                                    <div className="allocation-label">
                                        <span className="asset-name">{asset.charAt(0).toUpperCase() + asset.slice(1)}</span>
                                        <span className="asset-percent">{percentage}%</span>
                                    </div>
                                    <div className="allocation-bar-bg">
                                        <div
                                            className="allocation-bar-fill"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: getProfileColor(risk_profile)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Warnings/Errors */}
            {warning && (
                <div className="warning-message">
                    ⚠️ {warning}
                </div>
            )}

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {/* Reset Button */}
            <button onClick={onReset} className="reset-button">
                Start Over
            </button>
        </div>
    );
}

export default Results;
