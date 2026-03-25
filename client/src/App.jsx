/**
 * Robo-Advisor App - Main Component
 * NLP-Based Risk Profiler
 */

import { useState } from 'react';
import InputForm from './components/InputForm';
import Results from './components/Results';
import Admin from './components/Admin';
import { analyzeText } from './api/analyze';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleAnalyze = async (text) => {
    setIsLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const analysisResult = await analyzeText(text);
      const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
      setResult({ ...analysisResult, responseTime });
    } catch (err) {
      setError(err.message || 'Failed to analyze. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">Risk Profile Advisor</span>
      </header>

      <main className="main-content">
        {isAdmin ? (
          <Admin onClose={() => setIsAdmin(false)} />
        ) : !result ? (
          <>
            <InputForm onSubmit={handleAnalyze} isLoading={isLoading} />
            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}
          </>
        ) : (
          <Results result={result} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          ⚠️ This is a proof-of-concept tool for educational purposes only.
          Not financial advice.
        </p>
        {!isAdmin && (
          <button className="admin-link" onClick={() => setIsAdmin(true)}>
            Admin
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
