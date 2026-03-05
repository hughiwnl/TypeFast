import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchCompletion } from '../api';
import './GhostEditor.css';

const DEBOUNCE_MS = 400;
const MIN_WORDS = 3;

export default function GhostEditor() {
  const [text, setText] = useState('');
  const [wordGhost, setWordGhost] = useState('');
  const [sentenceGhost, setSentenceGhost] = useState('');
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const textareaRef = useRef(null);

  const scheduleCompletion = useCallback((value) => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setWordGhost('');
    setSentenceGhost('');

    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount < MIN_WORDS) return;

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const { wordGhost, sentenceGhost } = await fetchCompletion(value, '', controller.signal);
        setWordGhost(wordGhost);
        setSentenceGhost(sentenceGhost);
      } catch (e) {
        if (e.name !== 'AbortError') {
          // Backend not reachable — silent fail
        }
      }
    }, DEBOUNCE_MS);
  }, []);

  const handleKeyDown = (e) => {
    // Space: accept word completion only
    if (e.key === ' ' && wordGhost) {
      e.preventDefault();
      const accepted = text + wordGhost + ' ';
      setText(accepted);
      setWordGhost('');
      setSentenceGhost('');
      scheduleCompletion(accepted);
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
      setSentenceGhost('');
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

  return (
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
  );
}
