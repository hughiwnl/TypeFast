import GhostEditor from './components/GhostEditor';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <header className="toolbar">
        <div className="toolbar-left">
          <div className="toolbar-icon">T</div>
          <span className="toolbar-title">TypeFast</span>
        </div>
        <div className="toolbar-right">
          <span className="hint">Press <kbd>Tab</kbd> to accept suggestion</span>
          <span className="hint">Press <kbd>Space</kbd> to accept word</span>
        </div>
      </header>

      <main className="page-area">
        <div className="document-page">
          <GhostEditor />
        </div>
      </main>
    </div>
  );
}
