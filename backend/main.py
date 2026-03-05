from flask import Flask, request, jsonify
from flask_cors import CORS
from llmbackend import LLMModel

app = Flask(__name__)
CORS(app)

model = LLMModel()

@app.route('/complete', methods=['POST'])
def complete():
    data = request.json
    text = data.get('text', '')
    context = data.get('context', '')

    if not text.strip():
        return jsonify({'word_ghost': '', 'sentence_ghost': ''})

    word_ghost, sentence_ghost = model.complete(text, context)
    return jsonify({'word_ghost': word_ghost, 'sentence_ghost': sentence_ghost})

if __name__ == '__main__':
    app.run(debug=True)
