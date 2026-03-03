import { useState } from 'react';
import GhostEditor from './components/GhostEditor';
import './App.css';

export default function App() {
  const [context, setContext] = useState('');

  return (
    <div className="app">
      <h1 className="title">TypeFast</h1>
      <p className="subtitle">
        Start typing. Press <kbd>Tab</kbd> to accept a word completion.
      </p>

      <div className="context-row">
        <input
          className="context-input"
          type="text"
          placeholder="Writing context (optional) — e.g. 'a letter to my boss'"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </div>

      <GhostEditor context={context} />
    </div>
  );
}
