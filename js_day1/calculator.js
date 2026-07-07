const button = document.getElementById("calcBtn");

function calculateExpression() {
    const expression = window.prompt("계산할 수식을 입력하세요. 예: 2+3*4");

    if (expression === null) return;

    const trimmed = expression.trim();
    if (!trimmed) {
        window.alert("수식을 입력해 주세요.");
        return;
    }

    if (!/^[0-9+\-*/().\s]+$/.test(trimmed)) {
        window.alert("숫자와 +, -, *, /, (, )만 입력할 수 있습니다.");
        return;
    }

    try {
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${trimmed});`)();

        if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("Invalid result");
        }

        window.alert(`결과: ${result}`);
    } catch {
        window.alert("올바른 수식이 아닙니다.");
    }
}

button.addEventListener("click", calculateExpression);