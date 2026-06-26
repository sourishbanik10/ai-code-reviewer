from flask import Flask, render_template, request, jsonify
from services.ai_service import review_code
from services.ai_service import review_code, fix_code

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

@app.route("/fix", methods=["POST"])
def fix():

    code = request.json.get("code", "")
    language = request.json.get("language", "python")

    if not code.strip():
        return jsonify({"result": "Please enter some code."})

    try:

        fixed = fix_code(code, language)

        return jsonify({"result": fixed})

    except Exception as e:

        return jsonify({"result": str(e)})
    
    
if __name__ == "__main__":
    app.run(debug=True)