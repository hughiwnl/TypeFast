import { useState, useRef } from 'react';
import GhostEditor from './components/GhostEditor';
import './App.css';

export default function App() {
  const [limitReached, setLimitReached] = useState(false);
  const [showWelcome, setShowWelcome] = useState(
    !localStorage.getItem('typefast_welcomed')
  );
  const textRef = useRef('');

  const dismissWelcome = () => {
    localStorage.setItem('typefast_welcomed', 'true');
    setShowWelcome(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(textRef.current);
  };

  return (
    <div className="app">
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-modal">
            <div className="welcome-wordmark">What is TypeFast?</div>
            <p>
              The purpose of TypeFast is to help people with motor disabilities
              have an easier time typing through word and sentence auto completion.
              The goal is <strong>solely</strong> this. Once you are finished typing,
              editing things like font, spacing, and font size should be done in
              another document editor.
            </p>
            <p className="welcome-notice">
              <strong>IMPORTANT —</strong> This app is deployed mainly as a resume project,
              so completions are limited to <strong>20 per day</strong> across all users.
              If you'd like to use it without limits,{' '}
              <a href="https://github.com/hughiwnl/TypeFast" target="_blank" rel="noreferrer">
                visit the GitHub page
              </a>{' '}
              for installation instructions.
            </p>
            <button className="welcome-button" onClick={dismissWelcome}>
              Got it
            </button>
          </div>
        </div>
      )}
      <div className="app-wordmark">
        <span>Ty</span><span className="app-wordmark-ghost">pe</span><span className="app-wordmark-sentence">Fast</span>
      </div>
      <main className="page-area">
        {limitReached && (
          <div className="limit-banner">
            Daily request limit reached — autocomplete is disabled until tomorrow.
          </div>
        )}
        <div className="document-page">
          <GhostEditor
            onLimitReached={() => setLimitReached(true)}
            onTextChange={(t) => { textRef.current = t; }}
          />
        </div>
        <div className="left-panel">
          <div className="hints-panel">
            <div className="hints-title">Shortcuts</div>
            <ul className="hints-list">
              <li className="hint"><kbd>Space</kbd> accept word</li>
              <li className="hint"><kbd>Tab</kbd> accept sentence</li>
              <li className="hint"><kbd>`</kbd> pick alternative</li>
            </ul>
          </div>
          <button className="copy-button" onClick={handleCopy}>Copy</button>
        </div>
      </main>
      <a
        className="github-link"
        href="https://github.com/hughiwnl/TypeFast"
        target="_blank"
        rel="noreferrer"
        aria-label="View on GitHub"
      >
        <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
            0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
            -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87
            2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
            0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12
            0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68
            0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44
            1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15
            0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54
            1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38
            A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </a>
    </div>
  );
}
