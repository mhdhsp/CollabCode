import React from 'react';

const CallToAction = ({ primaryText = 'Get Started', secondaryText = 'Contact', onPrimary, onSecondary }) => {
  console.log("CallToAction rendered with props:", { primaryText, secondaryText });
  return (
    <div className="text-center my-4">
      <button className="btn btn-primary me-2" onClick={() => { console.log("Primary button clicked"); onPrimary(); }}>
        {primaryText}
      </button>
      <button className="btn btn-outline-secondary" onClick={() => { console.log("Secondary button clicked"); onSecondary(); }}>
        {secondaryText}
      </button>
    </div>
  );
};

export default CallToAction;
