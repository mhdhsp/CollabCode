// src/components/SignupForm.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { isEmail, minLength } from '../utils/validators';

const SignupForm = ({ onSubmit, submitting, error }) => {
  console.log('SignupForm component initialized');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ userName: null, email: null, password: null });

  const validate = () => {
    console.log('Validating signup form inputs');
    const fe = { userName: null, email: null, password: null };
    let valid = true;

    if (!userName.trim()) {
      fe.userName = 'Username is required.';
      valid = false;
    }

    if (!email.trim()) {
      fe.email = 'Email is required.';
      valid = false;
    } else if (!isEmail(email)) {
      fe.email = 'Please enter a valid email address.';
      valid = false;
    }

    if (!minLength(password, 6)) {
      fe.password = 'Password must be at least 6 characters.';
      valid = false;
    }

    console.log('Validation result:', valid, fe);
    setFieldErrors(fe);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup form submission started');
    setLocalError(null);
    if (!validate()) {
      console.log('Signup form validation failed');
      return;
    }

    try {
      console.log('Submitting signup data:', { userName, email, password });
      onSubmit({ userName: userName.trim(), email: email.trim(), password });
    } catch (err) {
      console.log('Error during signup submit:', err);
      setLocalError(err?.message || 'Failed to submit.');
    }
  };

  const topLevelError = localError || error;
  console.log('Rendering SignupForm, submitting:', submitting, 'error:', topLevelError);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {topLevelError && <div className="alert alert-danger">{topLevelError}</div>}

      <div className="mb-3">
        <label className="form-label">Username</label>
        <input
          type="text"
          className={`form-control ${fieldErrors.userName ? 'is-invalid' : ''}`}
          value={userName}
          onChange={(e) => {
            console.log('Username changed:', e.target.value);
            setUserName(e.target.value);
            setFieldErrors((s) => ({ ...s, userName: null }));
          }}
          placeholder="your-username"
          required
        />
        {fieldErrors.userName && <div className="invalid-feedback">{fieldErrors.userName}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Email address</label>
        <input
          type="email"
          className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
          value={email}
          onChange={(e) => {
            console.log('Email changed:', e.target.value);
            setEmail(e.target.value);
            setFieldErrors((s) => ({ ...s, email: null }));
          }}
          required
        />
        {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
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
        {submitting ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
};

SignupForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  error: PropTypes.string,
};

SignupForm.defaultProps = {
  submitting: false,
  error: null,
};

export default SignupForm;
