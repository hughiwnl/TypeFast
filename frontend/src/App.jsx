import GhostEditor from './components/GhostEditor';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <main className="page-area">
        <div className="document-page">
          <GhostEditor />
        </div>
        <div className="hints-panel">
          <div className="hints-title">Shortcuts</div>
          <ul className="hints-list">
            <li className="hint"><kbd>Space</kbd> accept word</li>
            <li className="hint"><kbd>Tab</kbd> accept sentence</li>
            <li className="hint"><kbd>`</kbd> pick alternative</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
