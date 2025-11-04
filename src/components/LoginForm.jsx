// src/components/LoginForm.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { isEmail } from '../utils/validators';

const LoginForm = ({ onSubmit, submitting, error }) => {
  console.log('LoginForm component initialized');
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ userNameOrEmail: null, password: null });

  const validate = () => {
    console.log('Validating form inputs');
    const fe = { userNameOrEmail: null, password: null };
    let valid = true;

    if (!userNameOrEmail.trim()) {
      fe.userNameOrEmail = 'Username or email is required.';
      valid = false;
    } else if (userNameOrEmail.includes('@') && !isEmail(userNameOrEmail)) {
      fe.userNameOrEmail = 'Please enter a valid email address.';
      valid = false;
    }

    if (!password) {
      fe.password = 'Password is required.';
      valid = false;
    }

    console.log('Validation result:', valid, fe);
    setFieldErrors(fe);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submission started');
    setLocalError(null);
    if (!validate()) {
      console.log('Form validation failed');
      return;
    }

    try {
      console.log('Submitting form data:', { userNameOrEmail, password });
      onSubmit({ userNameOrEmail: userNameOrEmail.trim(), password });
    } catch (err) {
      console.log('Error during submit:', err);
      setLocalError(err?.message || 'Failed to submit.');
    }
  };

  const topLevelError = localError || error;
  console.log('Rendering LoginForm, submitting:', submitting, 'error:', topLevelError);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {topLevelError && <div className="alert alert-danger">{topLevelError}</div>}

      <div className="mb-3">
        <label className="form-label">Username </label>
        <input
          type="text"
          className={`form-control ${fieldErrors.userNameOrEmail ? 'is-invalid' : ''}`}
          value={userNameOrEmail}
          onChange={(e) => {
            console.log('Username/Email changed:', e.target.value);
            setUserNameOrEmail(e.target.value);
            setFieldErrors((s) => ({ ...s, userNameOrEmail: null }));
          }}
          placeholder=" your-username"
          required
        />
        {fieldErrors.userNameOrEmail && <div className="invalid-feedback">{fieldErrors.userNameOrEmail}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Password</label>
        <input
          type="password"
          className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
          value={password}
          onChange={(e) => {
            console.log('Password changed');
            setPassword(e.target.value);
            setFieldErrors((s) => ({ ...s, password: null }));
          }}
          required
        />
        {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Signing in...' : 'Log In'}
      </button>
    </form>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  error: PropTypes.string,
};

LoginForm.defaultProps = {
  submitting: false,
  error: null,
};

export default LoginForm;
