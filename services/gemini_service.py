import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

# IMPORTANT: use env variable, not hardcoded string
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def review_with_gemini(code, language):

    prompt = f"""
You are an experienced Senior Software Engineer.

Review the following {language} code.

IMPORTANT RULES:
- Keep the review concise.
- Do NOT write long paragraphs.
- Use bullet points only.
- Keep each point under 20 words.
- Do NOT explain obvious things.
- If there are no issues, simply write "None".
- Limit the entire review to around 250 words.

Return ONLY this format:

# Code Review

## Summary
- ...

## Bugs
- ...

## Security
- ...

## Performance
- ...

## Best Practices
- ...

## Suggestions
- ...

## Score
X/10

Code:

{code}
"""

    response = model.generate_content(prompt)

    return response.text


    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                max_output_tokens=600,
            )
        )

        return response.text

    except Exception as e:
        return f"API Error:\n{str(e)}"