// src/components/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import './css/ForgotPasswordPage.css'; // Import CSS for styling

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage('If an account with that email exists, a password reset link will be sent.');
    }, 2000);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h1 className="forgot-password-title">Forgot Password</h1>
        {error && <div className="error-banner">{error}</div>}
        {message && <div className="success-banner">{message}</div>}
        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="forgot-password-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send Password Reset Link'}
          </button>
        </form>
        <div className="links">
          <p className="link"><a href="/login" className="link">Back to Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
