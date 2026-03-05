const BASE_URL = 'http://localhost:5001';

export async function fetchCompletion(text, context, signal) {
  const res = await fetch(`${BASE_URL}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, context }),
    signal,
  });
  const data = await res.json();
  return {
    wordGhost: data.word_ghost ?? '',
    alternatives: data.alternatives ?? [],
    sentenceGhost: data.sentence_ghost ?? '',
  };
}
