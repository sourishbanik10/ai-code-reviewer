from flask import Flask, render_template, request, jsonify
from services.ai_service import review_code

app = Flask(__name__)

# Home Page
@app.route("/")
def home():
    return render_template("index.html")


# Review API
@app.route("/review", methods=["POST"])
def review():

    code = request.json.get("code", "")
    language = request.json.get("language", "python")

    if not code.strip():
        return jsonify({
            "review": "Please enter some code."
        })

    try:
        feedback = review_code(code, language)

        return jsonify({
            "review": feedback
        })

    except Exception as e:
        return jsonify({
            "review": f"API Error:\n{str(e)}"
        })


if __name__ == "__main__":
    app.run(debug=True)