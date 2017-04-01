/*
* This file creates an Abstract Syntax Tree by reparsing the tokens
*/


function parse2() {
	parseIndex = 0;
	if (parseErrors.length > 0) {
		// do nothing
	} else {
		astTree.addNode("Block", "branch"); // create a Block branch node for the abstract syntax tree
		match();
		parseBlock2();
		astTree.endChildren();
		document.getElementById("atree").innerHTML += astTree;
	}
}

function parseBlock2() {
	if (currentTokenValue !== "}") {
		if (typeKeywords.indexOf(currentTokenValue) > -1) {
			parseVarDecl2();
		} else if (chars.indexOf(currentTokenValue) > -1) {
			parseAssignmentStatement2();
		} else if (currentTokenValue === "if") {
			parseIfStatement2();
		} else if (currentTokenValue === "while") {
			parseWhileStatement2();
		} else if (currentTokenValue === "print") {
			parsePrintStatement2();
		} else if (currentTokenValue === "{") {
			astTree.addNode("Block", "branch");
			match();
			parseBlock2();
		}
		parseBlock2();
	}	
}


function parseVarDecl2() {
	astTree.addNode("VarDecl", "branch");
	astTree.addNode(currentTokenValue, "leaf");
	match();
	astTree.addNode(currentTokenValue, "leaf");
	astTree.endChildren();
	match();
}


function parseAssignmentStatement2() {
	astTree.addNode("Assign", "branch");
	astTree.addNode(currentTokenValue, "leaf");
	match(); // the char
	match(); // the equals
	parseExpr2();
	astTree.endChildren();
	match();
}


function parseIfStatement2() {
	astTree.addNode("if", "branch");
	match(); // the if statement
	parseBooleanExpr2();
}


function parseWhileStatement2() {
	astTree.addNode("while", "branch");
	match(); // the while statement
	parseBooleanExpr2();
}


function parsePrintStatement2() {
	astTree.addNode("print", "branch");
	match(); // the print statement
	match(); // the paren
	parseExpr2();
}

function parseBooleanExpr2() {
	if (currentTokenValue !== "true" && currentTokenValue !== "false") {
		match(); // the paren
		var i = parseIndex+1;
		while (i < tokens.length) {
			if (tokens[i][1] === "==") {
				astTree.addNode("isEqual", "branch");
				break;
			} else if (tokens[i][1] === "!=") {
				astTree.addNode("notEqual", "branch");
				break;
			}
			i++;
		}
		parseExpr2();
	} else {
		astTree.addNode(currentTokenValue, "leaf");
	}
}


function parseExpr2() {
	if (chars.indexOf(currentTokenValue) > -1) {
			astTree.addNode(currentTokenValue, "leaf");
			match(); // the id
			match(); // the boolop
			parseExpr2();
	} else if (digits.indexOf(currentTokenValue) > -1) {
		if (tokens[parseIndex+1] === "+") {
			astTree.addNode("+", "branch");
			astTree.addNode(currentTokenValue,  "leaf");
			match(); // the digit
			match(); // the +
			parseExpr2();
		} else {
			astTree.addNode(currentTokenValue, "leaf");
			astTree.endChildren();
		}
	} else if (currentTokenValue === '"') {
		var charlist = "";
		match(); // the quote
		parseStringExpr2();
	} else if (currentTokenValue === "(") {
		parseBooleanExpr2();
	} else if (currentTokenValue === "==" || currentTokenValue === "!==") {
		match();
		parseExpr2();
	} else if (currentTokenValue === "{") {
		match();
		parseBlock2();
	} else if (currentTokenValue === ")") {
		match();
		tree.endChildren();
	}
}


function parseStringExpr2() {
	if (currentTokenValue === '"') {
		astTree.addNode(charlist, "leaf");
		match();
	} else if (chars.indexOf(currentTokenValue) > -1) {
		charlist = charlist + currentTokenValue;
		match();
		parseStringExpr2();
	}
}