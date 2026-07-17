import React from 'react';

interface WelcomeProps {
  onContinue: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onContinue }) => {
  return (
    <div className="welcome">

      <div className="welcome-content">
        <svg className="welcome-icon" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>

        <h1 className="welcome-title">DeBloat</h1>
      </div>

      <div className="welcome-footer">
        <button className="btn btn-primary welcome-continue" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};
