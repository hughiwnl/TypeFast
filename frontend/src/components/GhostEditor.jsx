import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchCompletion } from '../api';
import './GhostEditor.css';

const DEBOUNCE_MS = 400;
const MIN_WORDS = 3;

export default function GhostEditor({ context }) {
  const [text, setText] = useState('');
  const [ghost, setGhost] = useState('');
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const textareaRef = useRef(null);

  const scheduleCompletion = useCallback((value) => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setGhost('');

    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount < MIN_WORDS) return;

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const completion = await fetchCompletion(value, context, controller.signal);
        setGhost(completion);
      } catch (e) {
        if (e.name !== 'AbortError') {
          // Backend not reachable — silent fail
        }
      }
    }, DEBOUNCE_MS);
  }, [context]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && ghost) {
      e.preventDefault();
      const accepted = text + ghost;
      setText(accepted);
      setGhost('');
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
        <span className="editor-ghost">{ghost}</span>
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
