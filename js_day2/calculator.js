const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const keys = document.querySelector(".keys");

let expression = "";
let justCalculated = false;

function formatDisplay(value) {
    if (!value) return "0";
    return value
        .replaceAll("*", "×")
        .replaceAll("/", "÷")
        .replaceAll("-", "−");
}

function updateDisplay(preview = null) {
    expressionEl.textContent = formatDisplay(expression);
    if (preview !== null) {
        resultEl.textContent = preview;
        return;
    }

    resultEl.textContent = expression ? formatDisplay(expression) : "0";
}

function isOperator(value) {
    return ["+", "-", "*", "/"].includes(value);
}

function appendValue(value) {
    if (justCalculated && /[0-9.(]/.test(value)) {
        expression = "";
        justCalculated = false;
    }

    const last = expression.slice(-1);

    if (value === ".") {
        const currentNumber = expression.split(/[\+\-\*\/()]/).pop() ?? "";
        if (currentNumber.includes(".")) return;
        if (!currentNumber) {
            expression += "0.";
        } else {
            expression += ".";
        }
        updateDisplay();
        return;
    }

    if (isOperator(value)) {
        if (!expression && value !== "-") return;
        if (isOperator(last)) {
            expression = expression.slice(0, -1) + value;
        } else {
            expression += value;
        }
        justCalculated = false;
        updateDisplay();
        return;
    }

    expression += value;
    justCalculated = false;
    updateDisplay();
}

function clearAll() {
    expression = "";
    justCalculated = false;
    updateDisplay();
}

function backspace() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

function safeEvaluate(rawExpression) {
    if (!rawExpression) return "0";
    if (!/^[0-9+\-*/.()]+$/.test(rawExpression)) {
        throw new Error("Invalid characters");
    }
    // eslint-disable-next-line no-new-func
    const value = Function(`"use strict"; return (${rawExpression});`)();

    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error("Invalid result");
    }       

    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(10)));
}

function calculate() {
    try {
        const result = safeEvaluate(expression);
        resultEl.textContent = result;
        expressionEl.textContent = formatDisplay(expression);
        expression = result;
        justCalculated = true;
    } catch {
        resultEl.textContent = "오류";
        justCalculated = true;
    }
}

keys.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const { action, value } = button.dataset;

    if (action === "clear") {
        clearAll();
        return;
    }

    if (action === "backspace") {
        backspace();
        return;
    }

    if (action === "equals") {
        calculate();
        return;
    }

    if (value) {
        appendValue(value);
    }
});

document.addEventListener("keydown", (event) => {
    const { key } = event;

    if (/^[0-9]$/.test(key)) {
        appendValue(key);
        return;
    }

    if (["+", "-", "*", "/", "."].includes(key)) {
        appendValue(key);
        return;
    }

    if (["(", ")"].includes(key)) {
        appendValue(key);
        return;
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
        return;
    }

    if (key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
    }

    if (key === "Escape") {
        clearAll();
    }
});

updateDisplay();
