import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchCompletion } from '../api';
import './GhostEditor.css';

const DEBOUNCE_MS = 400;
const MIN_WORDS = 3;

export default function GhostEditor() {
  const [text, setText] = useState('');
  const [wordGhost, setWordGhost] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [sentenceGhost, setSentenceGhost] = useState('');
  const [selecting, setSelecting] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const textareaRef = useRef(null);

  const scheduleCompletion = useCallback((value) => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setWordGhost('');
    setAlternatives([]);
    setSentenceGhost('');
    setSelecting(false);

    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount < MIN_WORDS) return;

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const { wordGhost, alternatives, sentenceGhost } = await fetchCompletion(value, '', controller.signal);
        setWordGhost(wordGhost);
        setAlternatives(alternatives);
        setSentenceGhost(sentenceGhost);
      } catch (e) {
        if (e.name !== 'AbortError') {
          // Backend not reachable — silent fail
        }
      }
    }, DEBOUNCE_MS);
  }, []);

  const acceptWord = useCallback((suffix) => {
    const accepted = text + suffix + ' ';
    setText(accepted);
    setWordGhost('');
    setAlternatives([]);
    setSentenceGhost('');
    setSelecting(false);
    scheduleCompletion(accepted);
  }, [text, scheduleCompletion]);

  const handleKeyDown = (e) => {
    // Backtick: enter/exit selection mode
    if (e.key === '`') {
      if (wordGhost || alternatives.length > 0) {
        e.preventDefault();
        setSelecting((prev) => !prev);
      }
      return;
    }

    // While in selection mode, number keys pick an alternative
    if (selecting) {
      const num = parseInt(e.key);
      if (!isNaN(num)) {
        e.preventDefault();
        const all = [wordGhost, ...alternatives];
        const chosen = all[num - 1];
        if (chosen !== undefined) acceptWord(chosen);
        return;
      }
      // Any other key cancels selection mode and types normally
      setSelecting(false);
    }

    // Space: accept primary word ghost
    if (e.key === ' ' && wordGhost) {
      e.preventDefault();
      acceptWord(wordGhost);
      return;
    }

    // Tab: accept word + sentence together
    if (e.key === 'Tab' && (wordGhost || sentenceGhost)) {
      e.preventDefault();
      const base = text + wordGhost;
      const needsSpace = sentenceGhost &&
        !base.endsWith(' ') &&
        !/^[\s.,!?;:]/.test(sentenceGhost);
      const accepted = base + (needsSpace ? ' ' : '') + sentenceGhost;
      setText(accepted);
      setWordGhost('');
      setAlternatives([]);
      setSentenceGhost('');
      setSelecting(false);
      scheduleCompletion(accepted);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    scheduleCompletion(value);
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const prefix = text.split(' ').pop();
  const allSuggestions = [wordGhost, ...alternatives].filter(Boolean);

  // Always show 5 slots; fill with suggestions when available
  const slots = Array.from({ length: 5 }, (_, i) => allSuggestions[i] ?? null);

  return (
    <>
      <div className="editor-wrapper">
        <div className="editor-display" aria-hidden="true">
          <span className="editor-text">{text}</span>
          <span className="editor-word-ghost">{wordGhost}</span>
          <span className="editor-sentence-ghost">{sentenceGhost}</span>
        </div>

        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Start typing..."
        />
      </div>

      <div className={`suggestions-panel ${selecting ? 'selecting' : ''}`}>
        <div className="suggestions-prefix">
          {prefix ? `-${prefix}` : 'Suggestions'}
        </div>
        <ul className="suggestions-list">
          {slots.map((suffix, i) => (
            <li
              key={i}
              className={`suggestion-item ${suffix ? 'has-suffix' : 'empty'}`}
              onClick={() => suffix && acceptWord(suffix)}
            >
              <span className="suggestion-number">{i + 1}</span>
              <span className="suggestion-suffix">
                {suffix ? `-${suffix}` : '—'}
              </span>
            </li>
          ))}
        </ul>
        <div className="suggestions-hint">` then number to pick</div>
      </div>
    </>
  );
}
