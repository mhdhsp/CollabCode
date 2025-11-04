import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import { login } from '../utils/authUtils';  // Changed import
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';  // For redirect

const LoginPage = () => {
  console.log("LoginPage component rendered");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Checking authentication status");
    if (isAuthenticated()) {
      console.log("User already authenticated, navigating to /projects");
      navigate('/projects', { replace: true });
    }
  }, [navigate]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleLogin = async ({ userNameOrEmail, password }) => {
    console.log("handleLogin called with:", { userNameOrEmail });
    setSubmitting(true);
    setFormError(null);
    try {
      console.log("Attempting login...");
      await login({ userNameOrEmail, password });
      console.log("Login successful, navigating to /projects");
      navigate('/projects', { replace: true });
    } catch (err) {
      console.log("Login failed:", err);
      setFormError(err.message || 'Login failed');
    } finally {
      console.log("Login process complete, resetting submitting state");
      setSubmitting(false);
    }
  };

  console.log("Rendering login form");
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2>Sign in</h2>
          <p className="text-muted">Welcome back — sign in to continue.</p>
          <LoginForm onSubmit={handleLogin} submitting={submitting} error={formError} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
