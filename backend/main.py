from flask import Flask, request, jsonify
from flask_cors import CORS
from llmbackend import LLMModel
import threading
from datetime import date

DAILY_LIMIT = 20

_lock = threading.Lock()
_state = {'date': None, 'count': 0}

def check_and_increment():
    with _lock:
        today = str(date.today())
        if _state['date'] != today:
            _state['date'] = today
            _state['count'] = 0
        if _state['count'] >= DAILY_LIMIT:
            return False
        _state['count'] += 1
        return True

app = Flask(__name__)
CORS(app)

model = LLMModel()

@app.route('/complete', methods=['POST'])
def complete():
    if not check_and_increment():
        return jsonify({'error': 'Daily request limit reached. Try again tomorrow.'}), 429

    data = request.json
    text = data.get('text', '')[-3000:]
    context = data.get('context', '')

    if not text.strip():
        return jsonify({'word_ghost': '', 'alternatives': [], 'sentence_ghost': ''})

    word_ghost, alternatives, sentence_ghost = model.complete(text, context)
    return jsonify({'word_ghost': word_ghost, 'alternatives': alternatives, 'sentence_ghost': sentence_ghost})

@app.route('/status', methods=['GET'])
def status():
    with _lock:
        today = str(date.today())
        count = _state['count'] if _state['date'] == today else 0
    return jsonify({'requests_today': count, 'limit': DAILY_LIMIT, 'remaining': max(0, DAILY_LIMIT - count)})

if __name__ == '__main__':
    app.run(debug=True)
