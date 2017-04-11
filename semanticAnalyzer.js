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
		if (assignStatementCount >= varDeclCount) {
			semanticAnalysisError = currentTokenValue + " was not declared";
		} else {	
			assignStatementCount++;
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
			if (tokens[parseIndex3+1] === "+") {
				match3(); // the digit
				match3(); // the +
				parseExpr3();
			} else {
				match3();
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