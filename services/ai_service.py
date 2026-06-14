from services.gemini_service import review_with_gemini

def review_code(code, language):
    return review_with_gemini(code, language)

