import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")


def review_with_gemini(code, language):
    """
    Generate an AI code review.
    """

    prompt = f"""
You are a Senior Software Engineer.

Review the following {language} code.

IMPORTANT RULES:
- Keep the review concise.
- Use bullet points only.
- Do NOT write long paragraphs.
- Keep each point under 20 words.
- Do NOT explain obvious things.
- If there are no issues, write "None".
- Keep the review under 250 words.

Return ONLY in this format:

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
8/10

Code:

{code}
"""

    response = model.generate_content(prompt)

    return response.text


def fix_with_gemini(code, language):
    """
    Generate an improved version of the submitted code.
    """

    prompt = f"""
You are a Senior Software Engineer.

Rewrite the following {language} code into production-quality code.

Rules:

- Fix all bugs.
- Fix security issues.
- Improve performance.
- Follow clean coding practices.
- Preserve the original functionality.
- Use meaningful variable names.
- Add comments only where necessary.
- Do NOT include explanations outside the requested format.

Return EXACTLY in this format:

# Changes Made

- Fixed ...
- Improved ...
- Refactored ...

# Improved Code

```{language}
<complete improved code>
{code}
"""

    response = model.generate_content(prompt)

    return response.text