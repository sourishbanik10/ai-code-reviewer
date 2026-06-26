from services.gemini_service import (
    review_with_gemini,
    fix_with_gemini
)


def review_code(code, language):
    """
    Generate an AI review for the submitted code.
    """
    return review_with_gemini(code, language)


def fix_code(code, language):
    """
    Generate an improved version of the submitted code.
    """
    return fix_with_gemini(code, language)