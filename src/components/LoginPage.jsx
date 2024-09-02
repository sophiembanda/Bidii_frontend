import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './css/LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  
  // const backendUrl = process.env.REACT_APP_BACKEND_URL; // Use the environment variable

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/signin`, { username, password });
      if (response.status === 200) {
        // Save the token in localStorage
        localStorage.setItem('authToken', response.data.token);
        navigate('/dashboard'); // Redirect to dashboard or home
      }
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Login</h1>
        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="loading-spinner"></div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {formSubmitted && !username && <span className="input-error">Username is required</span>}
          </div>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </button>
            {formSubmitted && !password && <span className="input-error">Password is required</span>}
          </div>
          <div className="input-group remember-me-group">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <div className="links">
          <p className="link">Don't have an account? <a href="/signup" className="link">Sign Up</a></p>
          <p className="link"><a href="/forgot-password" className="link">Forgot Password?</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
