console.log("parse loaded");

function tokenize(input){
    const tokens = [];
    let idx = 0;
    while(idx < input.length){
        const char = input[idx];
        if(/[0-9.]/.test(char)){
            let numStr = "";
            let dot = false;
            while(idx < input.length && /[0-9.]/.test(input[idx])){
                if(input[idx] === "."){
                    if(dot) break;
                    dot = true;
                }
                numStr += input[idx];
                idx++;
            }
            tokens.push({type: "NUM", value: parseFloat(numStr)});
            continue;
        }
        else if(char === " "){
            idx++;
            continue;
        }
        else if("+-*/".includes(char)){
            tokens.push({type: "OP", value: char});
            idx++;
            continue;
        }
        else if(char === "("){tokens.push({type: "LPAREN", value: char}); idx++; continue;}
        else if(char === ")"){tokens.push({type: "RPAREN", value: char}); idx++; continue;}
        else if(char === "%"){tokens.push({type: "PERCENT", value: char}); idx++; continue;}
        throw new Error("unknown character");
    }
    return tokens;
}

function parse(tokens){
    let curr = 0;
    const peek = ()=>tokens[curr];
    const consume = ()=>tokens[curr++];
    function parseExpr(){
        let astLeaf = parseTerm();
        while(peek() && peek().type === "OP" && "+-".includes(peek().value)){
            const op = consume().value;
            const right = parseTerm();
            astLeaf = {type: "BinaryOp", op, left: astLeaf, right};
        }
        return astLeaf;
    }
    function parseTerm(){
        let astLeaf = parseUnary();
        while(peek() && peek().type === "OP" && "*/".includes(peek().value)){
            const op = consume().value;
            const right = parseUnary();
            astLeaf = {type: "BinaryOp", op, left: astLeaf, right};
        }
        return astLeaf;
    }
    function parseUnary(){
        if(peek() && peek().type === "OP" && (peek().value === "-" || peek().value === "+")){
            const op = consume().value;
            return {type: "UnaryOp", op, operand: parseUnary()};
        }
        return parsePrimary();
    }
    function parsePrimary(){
        const token = peek();
        if(token && token.type === "NUM"){
            consume();
            let astLeaf = {type: "Number", value: token.value};
            if(peek() && peek().type === "PERCENT"){
                consume();
                astLeaf = {type: "Percent", value: astLeaf};
            }
            return astLeaf;
        }
        if(token && token.type === "LPAREN"){
            consume();
            const astLeaf = parseExpr();
            if(!peek() || peek().type !== "RPAREN"){
                throw new Error("closing bracket missing");
            }
            consume();
            if(peek() && peek().type === "PERCENT"){
                consume();
                return {type: "Percent", value: astLeaf};
            }
            return astLeaf;
        }
        throw new Error("unexpected token");
    }
    const ast = parseExpr();
    if(curr !== tokens.length){
        throw new Error("remaining token");
    }
    return ast;
}

function evaluate(astLeaf){
    if(astLeaf.type === "Number"){
        return astLeaf.value;
    }
    if(astLeaf.type === "UnaryOp"){
        const val = evaluate(astLeaf.operand);
        return astLeaf.op === "-" ? -val : val;
    }
    if(astLeaf.type === "Percent"){
        return evaluate(astLeaf.value) / 100;
    }
    if(astLeaf.type === "BinaryOp"){
        if(astLeaf.right.type === "Percent"){
            const base = evaluate(astLeaf.left);
            const perct = evaluate(astLeaf.right.value) / 100;
            switch(astLeaf.op){
                case "+": return base + base * perct;
                case "-": return base - base * perct;
                case "*": return base * perct;
                case "/": return base / perct;
            }
        }
        const left = evaluate(astLeaf.left);
        const right = evaluate(astLeaf.right);
        switch(astLeaf.op){
            case "+": return left + right;
            case "-": return left - right;
            case "*": return left * right;
            case "/":
                if(right === 0){
                    throw new Error("cant divide by zero");
                }
                return left / right;
        }
    }
    throw new Error("unknown astLeaf: " + astLeaf.type);
}