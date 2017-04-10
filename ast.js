/*
* This file creates an Abstract Syntax Tree by reparsing the tokens
*/

// global variables 
var charlist = "";
var parseIndex2 = 0;
var scope = 0;

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
		scope = 0; // initialize scope
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
		} else if (currentTokenValue === "if") {
			parseIfStatement2();
		} else if (currentTokenValue === "while") {
			parseWhileStatement2();
		} else if (currentTokenValue === "print") {
			parsePrintStatement2();
		} else if (currentTokenValue === "{") {
			astTree.addNode("Block", "branch");
			match2();
			scope++;
			parseBlock2();
		} else if (currentTokenValue === "}") {
			scope--;
			match2();
			astTree.endChildren();
			parseBlock2();
		}
		parseBlock2();
	}
}


function parseVarDecl2() {
	var table = document.getElementById("symbolTable");
	var row = table.insertRow(1);
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);
	var cell5 = row.insertCell(4);
	astTree.addNode("VarDecl", "branch");
	astTree.addNode(currentTokenValue, "leaf");
	cell2.innerHTML = currentTokenValue; // add the symbol type to the symbol table
	match2(); // the type
	astTree.addNode(currentTokenValue, "leaf");
	astTree.endChildren();
	cell1.innerHTML = currentTokenValue; // add the symbol to the symbol table
	cell3.innerHTML = scope; // add the scope to the symbol table
	cell4.innerHTML = tokens[parseIndex][2];
	cell5.innerHTML = programCounter;
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
}


function parseWhileStatement2() {
	astTree.addNode("while", "branch");
	match2(); // the while statement
	parseBooleanExpr2();
}


function parsePrintStatement2() {
	astTree.addNode("print", "branch");
	match2(); // the print statement
	match2(); // the paren
	parseExpr2();
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
	} else {
		astTree.addNode(currentTokenValue, "leaf");
	}
}


function parseExpr2() {
	if (chars.indexOf(currentTokenValue) > -1) {
			astTree.addNode(currentTokenValue, "leaf");
			match2(); // the id
			match2(); // the boolop
			parseExpr2();
	} else if (digits.indexOf(currentTokenValue) > -1) {
		if (tokens[parseIndex2+1] === "+") {
			astTree.addNode("+", "branch");
			astTree.addNode(currentTokenValue,  "leaf");
			match2(); // the digit
			match2(); // the +
			parseExpr2();
		} else {
			astTree.addNode(currentTokenValue, "leaf");
			astTree.endChildren();
		}
	} else if (currentTokenValue === '"') {
		match2(); // the quote
		parseStringExpr2();
	} else if (currentTokenValue === "(") {
		parseBooleanExpr2();
	} else if (currentTokenValue === "==" || currentTokenValue === "!==") {
		match2();
		parseExpr2();
	} else if (currentTokenValue === "{") {
		match2();
		scope++;
		parseBlock2();
	} else if (currentTokenValue === ")") {
		match2();
		tree.endChildren();
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
