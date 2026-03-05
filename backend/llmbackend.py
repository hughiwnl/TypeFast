from openai import OpenAI
import os
import json

class LLMModel:
    def __init__(self):
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    def complete(self, text, context=""):
        prefix = text.split(' ')[-1]  # empty string if text ends with a space

        system_prompt = (
            "You are an autocomplete assistant helping someone with a motor disability type faster. "
            "The user is writing a document. You will receive the FULL text of that document so far.\n\n"
            "Your job is to predict what comes next based STRICTLY on the content, topic, and style "
            "of what the user has already written. Do NOT introduce random or unrelated content — "
            "continue the user's specific thought as if you are them.\n\n"
            "Return a JSON object with exactly three fields:\n"
            "- completed_word: the most likely full completion of the last partial word "
            "(empty string if the text ends with a space or punctuation)\n"
            "- alternatives: an array of up to 5 other plausible full word completions for the partial word, "
            "ordered by likelihood. Each must start with the same partial word. Do NOT include completed_word.\n"
            "- sentence_continuation: text that naturally continues the user's current thought AFTER "
            "the completed word. Do NOT repeat the completed word. Do NOT end with terminal punctuation. "
            "Keep it under 15 words.\n"
            "Return ONLY valid JSON."
        )

        user_prompt = f'Partial word: "{prefix}"\n\nFull document so far:\n{text}'
        if context:
            user_prompt = f"Writing context: {context}\n\n{user_prompt}"

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            max_tokens=200,
            temperature=0.5,
        )

        result = json.loads(response.choices[0].message.content)
        completed_word = result.get("completed_word", "")
        alternatives_raw = result.get("alternatives", [])
        sentence_continuation = result.get("sentence_continuation", "")

        # Compute the ghost suffix for the primary completion
        if prefix and completed_word.lower().startswith(prefix.lower()):
            word_ghost = completed_word[len(prefix):]
        else:
            word_ghost = ""

        # Compute suffixes for each alternative (only keep valid ones)
        alternatives = []
        for alt in alternatives_raw:
            if isinstance(alt, str) and alt.lower().startswith(prefix.lower()):
                alternatives.append(alt[len(prefix):])

        # Strip trailing terminal punctuation — user adds their own
        sentence_continuation = sentence_continuation.rstrip('.!?')

        # Ensure a leading space if the continuation starts with a word character
        if sentence_continuation and sentence_continuation[0].isalnum():
            sentence_continuation = ' ' + sentence_continuation

        return word_ghost, alternatives, sentence_continuation
