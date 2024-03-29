/*
* This file creates an Abstract Syntax Tree by reparsing the tokens
*/

var charlist = "";
var parseIndex2 = 0;

function match2() {
	parseIndex2++;
	if (parseIndex2 < tokens.length && tokens[parseIndex2] !== undefined) {
		currentTokenValue = tokens[parseIndex2][1];
	} else {
		parseIndex2--;
	}	
}

function parse2() {
	if (parseErrors.length > 0) {
		// do nothing
	} else {
		astTree.addNode("Block", "branch"); // create a Block branch node for the abstract syntax tree
		match2(); // the {
		parseBlock2();
		match2();
		astTree.endChildren();
		displayParse2Outcome();
	}
}

function parseBlock2() {
	if (currentTokenValue !== "$") {
		if (typeKeywords.indexOf(currentTokenValue) > -1) {
			parseVarDecl2();
		} else if (chars.indexOf(currentTokenValue) > -1) {
			parseAssignmentStatement2();
			//match2();
		} else if (currentTokenValue === "if") {
			parseIfStatement2();
		} else if (currentTokenValue === "while") {
			parseWhileStatement2();
		} else if (currentTokenValue === "print") {
			parsePrintStatement2();
		} else if (currentTokenValue === "{") {
			astTree.addNode("Block", "branch");
			match2();
			parseBlock2();
			astTree.endChildren();
		} else if (currentTokenValue === "}") {
			match2();
			astTree.endChildren();
			parseBlock2();
			astTree.endChildren();
		} else {
			match2();
			astTree.endChildren();
		}
		//astTree.endChildren();
		parseBlock2();
		astTree.endChildren();
	}	
}


function parseVarDecl2() {
	astTree.addNode("VarDecl", "branch");
	astTree.addNode(currentTokenValue, "leaf");
	match2(); // the type
	astTree.addNode(currentTokenValue, "leaf");
	astTree.endChildren();
	match2(); // the variable
}


function parseAssignmentStatement2() {
	astTree.addNode("Assign", "branch"); 
	astTree.addNode(currentTokenValue, "leaf");
	match2(); // the char
	match2(); // the equals
	parseExpr2();
	astTree.endChildren();
}


function parseIfStatement2() {
	astTree.addNode("if", "branch");
	match2(); // the if statement
	parseBooleanExpr2();
	parseBlock2();
	astTree.endChildren();
	//match2(); // the paren
}


function parseWhileStatement2() {
	astTree.addNode("while", "branch");
	match2(); // the while statement
	parseBooleanExpr2();
	parseBlock2();
	astTree.endChildren();
	//astTree.endChildren();
	//match2(); // the paren
}


function parsePrintStatement2() {
	astTree.addNode("print", "branch");
	match2(); // the print statement
	match2(); // the paren
	parseExpr2();
	astTree.endChildren();
	console.log(currentTokenValue);
	//astTree.endChildren();
	//astTree.endChildren();
	//astTree.endChildren();
	// match2(); // the paren
}

function parseBooleanExpr2() {
	if (currentTokenValue !== "true" && currentTokenValue !== "false") {
		match2(); // the paren
		var i = parseIndex2+1;
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
		astTree.endChildren();
	} else {
		if (tokens[parseIndex2+1][1] === "==" || tokens[parseIndex2+1][1] === "!=") {
			astTree.addNode("boolop", "branch");
			astTree.addNode(currentTokenValue, "leaf");
			match2(); // the boolval
			match2(); // the boolop
			parseExpr2();
			//astTree.endChildren();
		} else {
			astTree.addNode(currentTokenValue, "leaf");
			match2();
		}
	}
}


function parseExpr2() {
	if (chars.indexOf(currentTokenValue) > -1) {
		astTree.addNode(currentTokenValue, "leaf");
		match2(); // the id
		//match2(); // the boolop
		parseExpr2();
		//astTree.endChildren();
	} else if (digits.indexOf(currentTokenValue) > -1) {
		if (tokens[parseIndex2+1][1] === "+") {
			astTree.addNode("+", "branch");
			astTree.addNode(currentTokenValue,  "leaf");
			match2(); // the digit
			match2(); // the +
			parseExpr2();
			astTree.endChildren(); 
		} else if (tokens[parseIndex2+2][1] === "=") {
			astTree.addNode(currentTokenValue, "leaf");
			match2(); // the digit	
		} else {
			astTree.addNode(currentTokenValue, "leaf");
			match2(); // the digit
			parseExpr2();
			//astTree.endChildren();
		}
	} else if (currentTokenValue === '"') {
		match2(); // the quote
		parseStringExpr2();
		charlist = "";
	} else if (currentTokenValue === "(" || currentTokenValue === "true" || currentTokenValue === "false") {
		parseBooleanExpr2();
	} else if (currentTokenValue === "==" || currentTokenValue === "!=") {
		match2();
		parseExpr2();
	} else if (currentTokenValue === "{") {
		// match2();
		// parseBlock2();
	} else if (currentTokenValue === ")") {
		match2();
		// astTree.endChildren();
	} 
}


function parseStringExpr2() {
	if (currentTokenValue === '"') {
		astTree.addNode(charlist, "leaf");
		match2();
	} else if (chars.indexOf(currentTokenValue) > -1 || currentTokenValue === " ") {
		charlist = charlist + currentTokenValue;
		match2();
		parseStringExpr2();
	}
}


function displayParse2Outcome() {
	document.getElementById("atree").innerHTML += 'Program '+programCounter+' Abstract Syntax Tree\n';
	document.getElementById("atree").innerHTML += astTree;
	document.getElementById("atree").innerHTML += '------------------------------------\n';
}