import React, { useState } from 'react';
import Markdown from 'react-markdown';

const TravelRecommendations = () => {
  // User input state
  const [userQuery, setUserQuery] = useState('');
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    //clear previous recommendation
    setRecommendation('');

    try {
      //actual API call
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userQuery }),
      });

      if (response.status !== 200) {
        const parsedError: { err: string } = await response.json();
        setError(parsedError.err);
      } else {
        // Parse response and set recommendation
        const parsedResponse: string = await response.json();
        setRecommendation(parsedResponse);
      }
    } catch (_err) {
      setError('Error fetching recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="userQuery">
            Describe your ideal trip (e.g., "I want to go hiking in peaceful
            places with good food."):
          </label>
          <textarea
            id="userQuery"
            value={userQuery}
            onChange={e => setUserQuery(e.target.value)}
            placeholder="Enter your vacation preferences"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? 'Finding the perfect destinations...'
            : 'Get Recommendations'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {recommendation && (
        <div className="result">
          <h2>Your Recommendations:</h2>
          <p>
            <Markdown>{recommendation}</Markdown>
          </p>
        </div>
      )}
    </div>
  );
};

export default TravelRecommendations;
