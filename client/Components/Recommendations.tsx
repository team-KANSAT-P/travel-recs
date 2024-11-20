import React, { useState } from 'react';

interface ParsedResponse {
  destinationRecommendations: string[];
}

const TravelRecommendations = () => {
  // User input state
  const [userQuery, setUserQuery] = useState('');
  const [recommendation, setRecommendation] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation([]);

    try {
      // Mock API response data for testing
      const mockResponse: ParsedResponse = {
        destinationRecommendations: [
          'Aspen, Colorado - A beautiful location for hiking and nature retreats.',
          'Santorini, Greece - Perfect for a relaxing atmosphere and stunning views.',
          'Kyoto, Japan - Experience cultural immersion with scenic temples and gardens.',
          'Banff, Canada - Ideal for adventure seekers and breathtaking landscapes.',
          'Paris, France - A romantic getaway with world-class dining and art.',
        ],
      };

      // Simulate a delay to mimic API fetching
      setTimeout(() => {
        setRecommendation(mockResponse.destinationRecommendations);
        setLoading(false);
      }, 1000);
    } catch (_err) {
      setError('Error fetching recommendations. Please try again.');
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

      {recommendation.length > 0 && (
        <div className="result">
          <h2>Your Recommendations:</h2>
          <ul>
            {/* won't be a list - will just be a single div */}
            {recommendation.map((dest, index) => (
              <li key={index}>{dest}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TravelRecommendations;
