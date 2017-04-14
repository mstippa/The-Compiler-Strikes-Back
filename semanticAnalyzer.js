/*
* This file creates an Abstract Syntax Tree by reparsing the tokens
*/

// global variables 
var parseIndex3 = 0;
var scope = 0;
var varDeclCount = 0;
var assignStatementCount = 0;
var semanticAnalysisError = "";
var identifiers = [];
var warningCounter = 0;
var semanticAnalysisWarnings = []
var assignedId = "";
var assignedIdType = "";

function match3() {
	parseIndex3++;
	if (parseIndex3 < tokens.length && tokens[parseIndex3] !== undefined) {
		currentTokenValue = tokens[parseIndex3][1];
	} else {
		parseIndex3--;
	}	
}

function parse3() {
	if (parseErrors.length > 0) {
		// do nothing
	} else {
		charlist = "";
		scope = 0;
		varDeclCount = 0;
		assignStatementCount = 0;
		semanticAnalysisError = "";
		identifiers = [];
		match3(); // the {
		parseBlock3();
		match3();
		displayParse3Outcome();
	}
}

function parseBlock3() {
	if (semanticAnalysisError === "") {
		if (currentTokenValue !== "$") {
			console.log(currentTokenValue);
			if (typeKeywords.indexOf(currentTokenValue) > -1) {
				parseVarDecl3();
			} else if (chars.indexOf(currentTokenValue) > -1) {
				parseAssignmentSatement3();
			} else if (currentTokenValue === "if") {
				parseIfStatement3();
			} else if (currentTokenValue === "while") {
				parseWhileStatement3();
			} else if (currentTokenValue === "print") {
				parsePrintStatement3();
			} else if (currentTokenValue === "{") {
				match3();
				scope++;
				parseBlock3();
			} else if (currentTokenValue === "}") {
				scope--;
				match3();	
				parseBlock3();
			}
			parseBlock3();
		}
	}		
}


function parseVarDecl3() {
	if (semanticAnalysisError === "") {
		var table = document.getElementById("symbolTable");
		var row = table.insertRow(1);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);
		var cell4 = row.insertCell(3);
		var cell5 = row.insertCell(4);
		cell2.innerHTML = currentTokenValue; // add the symbol type to the symbol table
		identifiers.push(currentTokenValue);
		match3(); // the type
		var scopeCheck = identifiers.indexOf(currentTokenValue);
		if (scopeCheck > -1 && identifiers[scopeCheck+1] === scope) {
			semanticAnalysisError = currentTokenValue + " was already declared in scope " + scope;
		} else {
			identifiers.push(currentTokenValue);
			identifiers.push(scope);
			varDeclCount++;
			cell1.innerHTML = currentTokenValue; // add the symbol to the symbol table
			cell3.innerHTML = scope; // add the scope to the symbol table
			cell4.innerHTML = tokens[parseIndex][2]; // add the line number to the symbol table
			cell5.innerHTML = programCounter; // add the program number to the symbol table
			match3(); // the variable
		}	
	}		  
}


function parseAssignmentSatement3() {
	if (semanticAnalysisError === "") {
		if (identifiers.indexOf(currentTokenValue) < 0) {
			semanticAnalysisWarnings[warningCounter] = currentTokenValue + " was not initialized on line " + tokens[parseIndex3][2];
			warningCounter++;
			assignedId = currentTokenValue;
			match3(); // the char
			match3(); // the equals
			assignedIdType = currentTokenValue;
			parseExpr3();
			if (digits.indexOf(assignedIdType) > -1) {
				identifiers.push("int");
				identifiers.push(assignedId);
				identifiers.push(scope);
			} else if (assignedId === '"') {
				identifiers.push("string");
				identifiers.push(assignedId);
				identifiers.push(scope);
			} else if (assignedId === "(" || assignedId === "true" || assignedId === "false") {
				identifiers.push("boolean");
				identifiers.push(assignedId);
				identifiers.push(scope);
			}
		} else {
			assignStatementCount++;	
			typeCheck();
			match3(); // the char
			match3(); // the equals
			parseExpr3();
		}	
	}		
}


function parseIfStatement3() {
	if (semanticAnalysisError === "") {
		match3(); // the if statement
		parseBooleanExpr3();	
	}	
}


function parseWhileStatement3() {
	if (semanticAnalysisError === "") {
		match3(); // the while statement
		parseBooleanExpr3();
	}		
}


function parsePrintStatement3() {
	if (semanticAnalysisError === "") {
		match3(); // the print statement
		match3(); // the paren
		typeCheck();
		parseExpr3();
	}	
}

function parseBooleanExpr3() {
	if (semanticAnalysisError === "") {
		if (currentTokenValue !== "true" && currentTokenValue !== "false") {
			match3(); // the paren
			var i = parseIndex3+1;
			while (i < tokens.length) {
				if (tokens[i][1] === "==") {
					break;
				} else if (tokens[i][1] === "!=") {
					break;
				}
				i++;
			}
			typeCheck();
			parseExpr3();
		} else {
			// do nothing
		}
	}	
}


function parseExpr3() {
	if (semanticAnalysisError === "") {
		if (chars.indexOf(currentTokenValue) > -1) {
				match3(); // the id
				match3(); // the boolop
				parseExpr3();
		} else if (digits.indexOf(currentTokenValue) > -1) {
			if (tokens[parseIndex3+1][1] === "+") {
				typeCheck();
				match3(); // the digit
				match3(); // the +
				parseExpr3();
			} else {
				match3();
				parseExpr3();
			}
		} else if (currentTokenValue === '"') {
			match3(); // the quote
			parseStringExpr3();
		} else if (currentTokenValue === "(") {
			parseBooleanExpr3();
		} else if (currentTokenValue === "==" || currentTokenValue === "!==") {
			match3();
			parseExpr3();
		} else if (currentTokenValue === "{") {
			match3();
			scope++;
			parseBlock3();
		} else if (currentTokenValue === ")") {
			match3();
		}
	}		
}

function parseStringExpr3() {
	if (semanticAnalysisError === "") {
		if (currentTokenValue === '"') {
			match3();
		} else if (chars.indexOf(currentTokenValue) > -1 || currentTokenValue === " ") {
			match3();
			parseStringExpr3();
		}	
	}	
}


function findType (identifier) {
	var i = 1;
	var identifierType = "";
	var highestScope = -1;
	if (digits.indexOf(identifier) > -1) {
		return "int";
	} else if (identifier === '"') {
		return "string";
	} else if (identifier === "false" || identifier === "true") {
		return "boolean";
	}
	if (chars.indexOf(currentTokenValue) > -1) {
		if (identifiers.indexOf(currentTokenValue) < 0) {
			semanticAnalysisError = currentTokenValue + " was used before it was declared on line " + tokens[parseIndex3][2];
		}
	}
	if (semanticAnalysisError === "") {	
		while (i < identifiers.length) {
			if (identifier === identifiers[i]) {
				if (identifiers[i+1] === scope) {
					return(identifiers[i-1]);
				} else {
					if (identifiers[i+1] > highestScope) {
						highestScope = identifiers[i+1];
						identifierType = identifiers[i-1];
					}
				}
			}
			i = i + 3;
		}
		return identifierType;
	}	
}


function typeCheck() {
	var nextTokenValue = tokens[parseIndex3+2][1];
	var variableType = findType(currentTokenValue);
	if (semanticAnalysisError === "") {
		if (variableType === "int") {
			if (digits.indexOf(nextTokenValue) > -1) {
				// correct type
			} else if (chars.indexOf(nextTokenValue) > -1) {
				if (findType(nextTokenValue) !== "int") {
					semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2];
				} else {
					// correct type
				}
			} else {
				semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2];
			}
		} else if (variableType === "string") {
			if (nextTokenValue === '"') {
				// correct type
			} else if (chars.indexOf(nextTokenValue) > -1) {
				if (findType(nextTokenValue) !== "string") { 
					semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2];
				} else {
					// correct type
				}	
			}
		} else if (variableType === "boolean") {
			if (nextTokenValue === "true" || nextTokenValue === "false") {
				// correct type
			} else if (chars.indexOf(nextTokenValue) > -1) {
				if (findType(nextTokenValue) !== "boolean") {
					semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2];
				} else {
					// correct type
				}
			}
		}
	}	

}
 
function displayParse3Outcome() {
	if (semanticAnalysisError === "") {
		document.getElementById("output").innerHTML += '<p>Semantic Analysis Completed for program '+programCounter+' with no errors</p>';
		document.getElementById("output").innerHTML += '<p>------------------------------------</p>';
	} else {
		document.getElementById("output").innerHTML += '<p>Semantic Analysis Completed for program '+programCounter+' with an error:</p>';
		document.getElementById("output").innerHTML += '<p>'+semanticAnalysisError+'</p>';
		document.getElementById("output").innerHTML += '<p>Symbol table was not constructed</p>';
		document.getElementById("output").innerHTML += '<p>------------------------------------</p>';
	}	 
}