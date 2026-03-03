from openai import OpenAI
import os

class LLMModel:
    def __init__(self):
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    def complete(self, text, context=""):
        system_prompt = (
            "You are an autocomplete assistant helping someone with a motor disability type faster. "
            "Given the text typed so far, complete the current partial word (if any) and suggest "
            "a natural continuation of up to one sentence. "
            "Return ONLY the text to append directly after the cursor — no quotes, no explanation. "
            "Keep the suggestion concise and natural."
        )

        user_prompt = f"Text: {text}"
        if context:
            user_prompt = f"Context: {context}\n\n{user_prompt}"

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=50,
            temperature=0.3,
        )

        return response.choices[0].message.content
