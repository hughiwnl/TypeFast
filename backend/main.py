import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from llmbackend import LLMModel

app = Flask(__name__)
# Comma-separated list of allowed origins; defaults to any origin.
CORS(app, origins=os.environ.get('CORS_ORIGINS', '*').split(','))

model = LLMModel()

@app.route('/complete', methods=['POST'])
def complete():
    data = request.json
    text = data.get('text', '')[-3000:]
    context = data.get('context', '')

    if not text.strip():
        return jsonify({'word_ghost': '', 'alternatives': [], 'sentence_ghost': ''})

    word_ghost, alternatives, sentence_ghost = model.complete(text, context)
    return jsonify({'word_ghost': word_ghost, 'alternatives': alternatives, 'sentence_ghost': sentence_ghost})

if __name__ == '__main__':
    app.run(port=5001)
