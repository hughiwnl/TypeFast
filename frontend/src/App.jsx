import { useState, useRef } from 'react';
import GhostEditor from './components/GhostEditor';
import './App.css';

export default function App() {
  const [limitReached, setLimitReached] = useState(false);
  const textRef = useRef('');

  const handleCopy = () => {
    navigator.clipboard.writeText(textRef.current);
  };

  return (
    <div className="app">
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
    </div>
  );
}
