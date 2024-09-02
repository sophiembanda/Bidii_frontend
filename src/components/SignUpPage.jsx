import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/SignUpPage.css'; // Import CSS for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const SignUpPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // State for is_admin
  const [role, setRole] = useState('user'); // State for role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for showing confirm password

  const navigate = useNavigate(); // Initialize useNavigate
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  // const backendUrl = process.env.REACT_APP_BACKEND_URL; // Use the environment variable

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    // Form validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions.');
      return;
    }

    try {
      setLoading(true);

      // Transform role to lowercase before sending
      const transformedRole = role.toLowerCase();

      // API request to signup endpoint
      const response = await axios.post(`${apiUrl}/signup`, {
        username: fullName,
        email,
        password,
        role: transformedRole,
        is_admin: isAdmin // This will be true or false based on the checkbox
      });

      if (response.status === 201) {
        setSuccessMessage('Account created successfully. Please log in.');
        setTimeout(() => {
          navigate('/'); // Redirect to login page after 2 seconds
        }, 2000);
      } else {
        setError('Failed to create user.');
      }
    } catch (err) {
      if (err.response) {
        // Server errors
        setError(err.response.data.message || 'Failed to create user.');
      } else {
        // Network errors
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">Sign Up</h1>
        {error && <div className="error-banner">{error}</div>}
        {successMessage && <div className="success-banner">{successMessage}</div>}
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEye : faEyeSlash}
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>
          <div className="input-group password-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEye : faEyeSlash}
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="accountant">Accountant</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div className="is-admin-group">
            <input
              type="checkbox"
              id="is_admin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <label htmlFor="is_admin" className="is-admin-label">Is Admin</label>
          </div>
          <div className="terms-group">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
            <label htmlFor="terms">I accept the terms and conditions</label>
          </div>
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <div className="links">
          <p className="link">Already have an account? <a href="/login" className="link">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
