import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';
import { signup } from '../utils/authUtils';
import { isAuthenticated } from '../utils/authUtils';

const SignupPage = () => {
  console.log("SignupPage component rendered");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Checking authentication for redirect");
    if (isAuthenticated()) {
      console.log("User already authenticated, redirecting to /projects");
      navigate('/projects', { replace: true });
    }
  }, [navigate]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSignup = async ({ userName, email, password }) => {
    console.log("Signup started", { userName, email });
    setSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);

    try {
      const res = await signup({ userName, email, password });
      console.log("Signup successful", res);
      const serverMessage = res?.Message ?? 'Account created successfully. Please sign in.';
      setSuccessMsg(serverMessage);
      setTimeout(() => {
        console.log("Redirecting to login page");
        navigate('/login', { replace: true });
      }, 700);
    } catch (err) {
      console.log("Signup failed", err);
      setFormError(err.message || 'Signup failed');
    } finally {
      console.log("Signup process ended");
      setSubmitting(false);
    }
  };

  console.log("Rendering signup form UI");
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2>Create an account</h2>
          <p className="text-muted">Join and collaborate in realtime.</p>
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          <SignupForm onSubmit={handleSignup} submitting={submitting} error={formError} />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
