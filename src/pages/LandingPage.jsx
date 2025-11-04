// src/pages/LandingPage.js
import React from 'react';
import LandingHero from "../components/LandingHero";
import CallToAction from '../components/CallToAction';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  console.log("LandingPage component rendered");
  return (
    <div>
      {console.log("Rendering LandingHero")}
      <LandingHero />
      <section className="py-5">
        {console.log("Rendering Features section")}
        <div className="container">
          <h2 className="h4">Features</h2>
          {console.log("Rendering Features heading")}
          <p className="text-muted">
            Real-time collaboration, instant syncing, and lightweight editor integrations to keep your team productive.
          </p>
          {console.log("Rendering Features description")}

          <div className="row">
            {console.log("Rendering Features row")}
            <div className="col-md-4">
              {console.log("Rendering Low Latency feature")}
              <h5>Low Latency</h5>
              <p className="text-muted">Optimized sync for near-instant updates across teammates.</p>
            </div>
            <div className="col-md-4">
              {console.log("Rendering Editor Agnostic feature")}
              <h5>Editor Agnostic</h5>
              <p className="text-muted">Works with your workflow and supports external editors.</p>
            </div>
            <div className="col-md-4">
              {console.log("Rendering Secure feature")}
              <h5>Secure</h5>
              <p className="text-muted">Authentication and secure transport by default.</p>
            </div>
          </div>

          {console.log("Rendering CallToAction component")}
          <CallToAction
            primaryText="Get Started"
            secondaryText="Contact"
            onPrimary={() => { console.log("Get Started clicked"); navigate('/signup'); }}
            onSecondary={() => { console.log("Contact clicked"); navigate('/contact'); }}
          />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
