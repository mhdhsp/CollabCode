// src/components/Footer.js
import React from 'react';

function Footer() {
  console.log('Footer component rendering started');
  const year = new Date().getFullYear();
  console.log('Current year:', year);
  const element = (
    <footer className="bg-light py-3 mt-auto">
      <div className="container text-center">
        <small className="text-muted">© {year} Realtime Editor — Prototype</small>
      </div>
    </footer>
  );
  console.log('Footer component rendering completed');
  return element;
}

export default Footer;
