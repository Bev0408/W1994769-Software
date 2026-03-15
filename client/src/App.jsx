/**
 * Robo-Advisor App - Main Component
 * NLP-Based Risk Profiler
 */

import { useState } from 'react';
import InputForm from './components/InputForm';
import Results from './components/Results';
import { analyzeText } from './api/analyze';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (text) => {
    setIsLoading(true);
    setError(null);

    try {
      const analysisResult = await analyzeText(text);
      setResult(analysisResult);
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
      <main className="main-content">
        {!result ? (
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
      </footer>
    </div>
  );
}

export default App;
