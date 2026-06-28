let diffEditor = null;
let lastReview = "";
let fixedCode = "";
let originalCode = "";
let editor;
require.config({
    paths: {
        vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
    }
});

require(["vs/editor/editor.main"], function () {

    editor = monaco.editor.create(
        document.getElementById("editor"),
        {
            value: `def hello():
    print("Hello World")`,
            language: "python",
            theme: "vs-dark",
            automaticLayout: true,
            minimap: {
                enabled: true
            }
        }
    );

});

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const codeInput = document.getElementById("codeInput");
const browseBtn = document.getElementById("browseBtn");

browseBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", loadFile);

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.classList.remove("dragover");

    const files = e.dataTransfer.files;

    if(files.length){
        readFile(files[0]);
    }

});

function loadFile(event){

    const file = event.target.files[0];

    if(file){
        readFile(file);
    }

}
function readFile(file) {

    const reader = new FileReader();

    reader.onload = function(e) {

        if (editor) {
            editor.setValue(e.target.result);
        } else {
            console.error("Monaco editor is not initialized.");
        }

    };

    reader.readAsText(file);

}

function detectLanguage(filename) {

    const ext = filename.split(".").pop().toLowerCase();

    const map = {
        py: "python",
        js: "javascript",
        java: "java",
        cpp: "cpp",
        c: "c",
        cs: "csharp",
        php: "php",
        go: "go",
        rb: "ruby",
        ts: "typescript",
        html: "html",
        css: "css",
        json: "json"
    };

    return map[ext] || "plaintext";
}

async function reviewCode() {
    const code = editor.getValue();
    const language = document.getElementById("language").value;

    const result = document.getElementById("result");
    const btn = document.getElementById("reviewBtn");

    result.innerHTML = "<h3>🔍 Analyzing code...</h3>";

    btn.disabled = true;
    btn.innerText = "Reviewing...";

    try {
        const startTime = performance.now();
        const response = await fetch("/review", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code: code,
                language: language
            })
        });

        const data = await response.json();

        btn.disabled = false;
        btn.innerText = "Review Code";

        lastReview = data.review;
        const endTime = performance.now();

document.getElementById("reviewTime").innerText =
    ((endTime - startTime) / 1000).toFixed(2) + "s";

document.getElementById("reviewLanguage").innerText =
    language.toUpperCase();
        const sections = lastReview.split(/\n(?=# )|\n(?=## )/g);

        result.innerHTML = "";
        // Score

const scoreMatch = lastReview.match(/(\d+(\.\d+)?)\/10/);

document.getElementById("score").innerText =
    scoreMatch ? scoreMatch[1] + "/10" : "--";


// Bugs

const bugs = (
    lastReview.match(/bug/gi) || []
).length;

document.getElementById("bugs").innerText = bugs;


// Security

const security = (
    lastReview.match(/security/gi) || []
).length;

document.getElementById("security").innerText =
    security;


// Performance

const performanceCount = (
    lastReview.match(/performance/gi) || []
).length;

document.getElementById("performance").innerText =
    performanceCount;

        sections.forEach((section, index) => {

            const card = document.createElement("div");
            card.className = "card";

            result.appendChild(card);

            setTimeout(() => {
            card.innerHTML = marked.parse(section);
            }, index * 200);

        });

    } catch(error) {

        btn.disabled = false;
        btn.innerText = "Review Code";

        result.innerText =
            "Something went wrong. Please try again.";

        console.error(error);
    }
}


function copyReview() {

    if (!lastReview) {
        alert("No review available to copy.");
        return;
    }

    navigator.clipboard.writeText(lastReview)
        .then(() => {
            alert("📋 Review copied!");
        })
        .catch(err => {
            console.error(err);
        });
}


function downloadReview() {

    if (!lastReview) {
        alert("No review available to download.");
        return;
    }

    const blob = new Blob(
        [lastReview],
        { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "ai-code-review.txt";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}


function typeWriter(text, element, speed = 10) {

    let i = 0;

    function typing() {

        if (i < text.length) {

            element.innerHTML += text.charAt(i);

            i++;

            setTimeout(
                typing,
                speed
            );
        }
    }

    typing();
}

async function fixCode() {

    const code = editor.getValue();
    originalCode = code; 
    const language = document.getElementById("language").value;

    const result = document.getElementById("result");

    result.innerHTML = "<h3>✨ AI is improving your code...</h3>";

    try {

        const response = await fetch("/fix", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                code: code,
                language: language
            })

        });

        const data = await response.json();

        const aiResponse = data.result;

        // Save complete response
        lastReview = aiResponse;

        // Extract only code block
        const match = aiResponse.match(/```[\w]*\n([\s\S]*?)```/);

        if (match) {
            fixedCode = match[1].trim();
        } else {
            fixedCode = "";
        }

        result.innerHTML = marked.parse(aiResponse);

    }

    catch (error) {

        console.error(error);

        result.innerHTML =
            "<h3>❌ Failed to improve the code.</h3>";

    }

}

function applyFixes() {

    if (!fixedCode) {

        alert("Generate AI fixes first.");

        return;

    }

    editor.setValue(fixedCode);

    alert("✅ AI fixes applied!");

}

function compareCode() {

    if (!originalCode || !fixedCode) {

        alert("Generate AI fixes first.");

        return;

    }

    const result = document.getElementById("result");

    if(diffEditor){

    diffEditor.dispose();

}

result.innerHTML = `
    <div id="diffEditor"></div>
`;
    diffEditor = monaco.editor.createDiffEditor(

        document.getElementById("diffEditor"),

        {

            theme: "vs-dark",

            automaticLayout: true,

            readOnly: true,

            renderSideBySide: true,

            minimap: {

                enabled: false

            }

        }

    );

    const originalModel = monaco.editor.createModel(

        originalCode,

        document.getElementById("language").value

    );

    const modifiedModel = monaco.editor.createModel(

        fixedCode,

        document.getElementById("language").value

    );

    diffEditor.setModel({

        original: originalModel,

        modified: modifiedModel

    });

}



function escapeHtml(text) {

    return text

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;");

}