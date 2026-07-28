console.log("main loaded");

const exprEl = document.getElementById("expr");
const resultEl = document.getElementById("result");

let expr = "";
let hasCalc = false;

function updDisplay(){
    exprEl.textContent = "\u00A0";
    resultEl.textContent = expr || "0";
}

document.getElementById("tSwitch").addEventListener("change", (e) => {
    document.body.classList.toggle("dark", e.target.checked);
});

function calc(){
    if(!expr.trim()) return;
    try{
        const tokens = tokenize(expr);
        const ast = parse(tokens);
        let result = evaluate(ast);
        result = Math.round((result + Number.EPSILON) * 1e10) / 1e10;
        exprEl.textContent = expr + " =";
        resultEl.textContent = result;
        expr = String(result);
        hasCalc = true;
    }
    catch(err){
        exprEl.textContent = expr + " =";
        resultEl.textContent = err.message;
        expr = "";
        hasCalc = false;
    }
}

document.querySelectorAll(".btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        const value = btn.dataset.value;
        const action = btn.dataset.action;
        if(value){
            if(hasCalc){
                const isOp = ["+","-","*","/"].includes(value);
                if(!isOp) expr = "";
                hasCalc = false;
            }
            expr += value;
            updDisplay();
            return;
        }
        switch(action){
            case "clear":
                expr = "";
                hasCalc = false;
                exprEl.textContent = "\u00A0";
                resultEl.textContent = "0";
                break;
            case "back":
                if (hasCalc) {
                    expr = String(expr).slice(0, -1);
                    if (expr === "") expr = "0";
                    hasCalc = false;
                } else {
                    expr = expr.slice(0, -1);
                }
                updDisplay();
                break;
            case "eq":
                calc();
                break;
        }
    });
});

updDisplay();