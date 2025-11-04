// src/components/LandingHero.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white d-flex align-items-center justify-content-center text-center" style={{ minHeight: '100vh' }}>
      <div className="container">
        <h1 className="display-5 fw-bold">Realtime Collaborative Code Editor</h1>
        <p className="lead text-muted">Collaborate on code in real time — minimal latency, instant sync.</p>
        <div className="mt-4">
          <button className="btn btn-primary me-2" onClick={() => navigate('/signup')}>
            Get Started
          </button>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/contact')}>
            Contact
          </button>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
