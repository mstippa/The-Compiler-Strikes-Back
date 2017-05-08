/*
* This file semantically analyzes the source code by reparsing the tokens
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
var rowNum = 1;
var previousScope = 0;

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
		semanticAnalysisWarnings = []
		assignedId = "";
		assignedIdType = "";
		warningCounter = 0;
		match3(); // the {
		parseBlock3();
		match3();
		unusedIDs();
		displayParse3Outcome();

		if (semanticAnalysisError === "") {
			displaySymbolTable();
		}	
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
				//previousScope = scope;
				parseIfStatement3();
			} else if (currentTokenValue === "while") {
				// previousScope = scope;
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
			} else {
				match3();
			}
			parseBlock3();
		}
	}		
}


function parseVarDecl3() {
	if (semanticAnalysisError === "") {
		identifiers.push(currentTokenValue);
		match3(); // the type
		var scopeCheck = identifiers.indexOf(currentTokenValue);
		if (scopeCheck > -1 && identifiers[scopeCheck+1] === scope) {
			semanticAnalysisError = currentTokenValue + " was already declared in scope " + scope;
		} else {
			identifiers.push(currentTokenValue);
			identifiers.push(scope);
			identifiers.push(tokens[parseIndex3][2]);
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
				identifiers.push(tokens[parseIndex3][2])
			} else if (assignedId === '"') {
				identifiers.push("string");
				identifiers.push(assignedId);
				identifiers.push(scope);
				identifiers.push(tokens[parseIndex3][2])
			} else if (assignedId === "(" || assignedId === "true" || assignedId === "false") {
				identifiers.push("boolean");
				identifiers.push(assignedId);
				identifiers.push(scope);
				identifiers.push(tokens[parseIndex3][2]);
			}
		} else {
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
		//match3(); // the paren
		/*if (undeclaredIDs() === false) {
			semanticAnalysisError = currentTokenValue + " was used before it was declared on line " + tokens[parseIndex3][2];
		}*/
		parseBooleanExpr3();
		match3(); // the paren
	}	
}


function parseWhileStatement3() {
	if (semanticAnalysisError === "") {
		match3(); // the while statement
		//match3(); // the paren
		/*if (undeclaredIDs() === false) {
			semanticAnalysisError = currentTokenValue + " was used before it was declared on line " + tokens[parseIndex3][2];
		}*/
		parseBooleanExpr3();
		match3(); // the paren
	}		
}


function parsePrintStatement3() {
	if (semanticAnalysisError === "") {
		match3(); // the print statement
		match3(); // the paren
		if (undeclaredIDs() === false) {
			semanticAnalysisError = currentTokenValue + " was used before it was declared on line " + tokens[parseIndex3][2];
		}
		//typeCheck();
		parseExpr3();
		match3();
	}	
}

function parseBooleanExpr3() {
	if (semanticAnalysisError === "") {
		if (currentTokenValue !== "true" && currentTokenValue !== "false") {
			match3(); // the paren
			if (undeclaredIDs() === false) {
				semanticAnalysisError = currentTokenValue + " was used before it was declared on line " + tokens[parseIndex3][2];
			}
			if (semanticAnalysisError === "") {
				//typeCheck();
				parseExpr3();
				if (currentTokenValue === "!=" || currentTokenValue === "==") {
					parseExpr3();
				}
			}	
		} else {
			if (tokens[parseIndex3+1][1] === "==" || tokens[parseIndex3+1][1] === "!=") {
			match3(); // the boolval
			match3(); // the boolop
			parseExpr3();
			} else {
				match3();
			}
		}
	}	
}


function parseExpr3() {
	if (semanticAnalysisError === "") {
		if (chars.indexOf(currentTokenValue) > -1) {
				typeCheck();
				match3(); // the id
		} else if (digits.indexOf(currentTokenValue) > -1) {
			if (tokens[parseIndex3+1][1] === "+") {
				typeCheck();
				match3(); // the digit
				match3(); // the +
				parseExpr3();
			} else {
				match3();
			}
		} else if (currentTokenValue === '"') {
			if (tokens[parseIndex3-1][1] === "=") {
				match3();
				parseStringExpr3();
			} else {
				typeCheck();
				//console.log(currentTokenValue);
				match3(); // the quote
				//parseStringExpr3();
			}
		} else if (currentTokenValue === "(" || currentTokenValue === "true" || currentTokenValue === "false") {
			parseBooleanExpr3();
		} else if (currentTokenValue === "==" || currentTokenValue === "!=") {
			match3();
			parseExpr3();
		} else if (currentTokenValue === "{") {
			match3();
			scope++;
			parseBlock3();
		} else if (currentTokenValue === ")") {
			match3();
		} else if (currentTokenValue === "false" || currentTokenValue === "true") {
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


function identifyString() {
	if (currentTokenValue === '"') {
	} else {
		match3();
		identifyString();
	}
}

function findType (identifier) {
	findTypeIndex = 1;
	var identifierType = "";
	var highestScope = 50;
	if (digits.indexOf(identifier) > -1) {
		return "int";
	} else if (identifier === '"') {
		match3(); // the quote
		identifyString();
		return "string";
	} else if (identifier === "false" || identifier === "true") {
		return "boolean";
	}
	if (chars.indexOf(identifier) > -1) {
		if (identifiers.indexOf(identifier) < 0) {
			semanticAnalysisError = identifier + " was used before it was declared on line " + tokens[parseIndex3][2];
		}
	}
	if (semanticAnalysisError === "") {	
		while (findTypeIndex < identifiers.length) {
			if (identifier === identifiers[findTypeIndex]) {
				if (identifiers[findTypeIndex+1] === scope) {
					if (checkScope(identifiers[findTypeIndex])) {
						return(identifiers[findTypeIndex-1]);
					} else {
						// do nothing
					}
				} else {
					if (identifiers[findTypeIndex+1] < highestScope) {
						highestScope = identifiers[findTypeIndex+1];
						identifierType = identifiers[findTypeIndex-1];
					}
				}
			}
			findTypeIndex = findTypeIndex + 4;
		}
		//console.log(identifierType);
		return identifierType;
	}	
}


function findScope(identifier) {
	var identifierScope = 0;
	var highestScope = 50;
	var i = 1;
	while (i < identifiers.length) {
			if (identifier === identifiers[i]) {
				if (identifiers[i+1] === scope) {
					if (checkScope(identifiers[i])) {
						return(identifiers[i+1]);
					} else {
						// do nothing
					}		
				} else {
					if (identifiers[i+1] < highestScope) {
						highestScope = identifiers[i+1];
						identifierScope = identifiers[i+1];
					}
				}
			}
			i = i + 4;
		}
		return identifierScope;
}


function checkScope(id) {
	var i = 0;
	while (i < tokens.length) {
		if (tokens[i][1] === "if" || tokens[i][1] === "while") {
			i++
			while (i !== "}") {
				if (tokens[i] !== undefined) {
					if (id === tokens[i][1] && tokens[i][0] === "token_id") {
						if (tokens[i-1][1] !== "(" || tokens[i+1][1] !== ")") {
							if (tokens[i-1][0] === "token_string" || tokens[i-1][0] === "token_int" || tokens[i-1][0] === "token_boolean") {
								var idType = tokens[i-1][0];
								var n = 1;
								if (idType === "token_string") {
									idType = "string"
								} else if (idType === "token_int") {
									idType = "int"
								} else {
									idType = "boolean"
								}	
								while (n < identifiers.length) {
									if (identifiers[n] === id && identifiers[n-1] === idType) {
										if (identifiers[n+1] === scope) {
											return false;
										} else {
											return true
										}
									}
									n++; 
								}			
							} else {
								return true;
							}
						}		
					}
					i++;
				} else {
					return true;
				}
			}
			return true;	
		}
		i++;
	}
	return true;
}


function typeCheck() {
	var variableType = findType(currentTokenValue);
	var nextTokenValue = tokens[parseIndex3+2][1];
	if (semanticAnalysisError === "") {
		if (variableType === "int") {
			if (digits.indexOf(nextTokenValue) > -1) {
				// correct type
			} else if (chars.indexOf(nextTokenValue) > -1) {
				//console.log(findType(nextTokenValue));
				if (tokens[parseIndex3+1][1] === "==" || tokens[parseIndex3+1][1] === "!=" || tokens[parseIndex3+1][1] === "+" || tokens[parseIndex3+1][1] === "=") {
					if (findType(nextTokenValue) !== "int") {
						semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2] + " expecting an int";
					} else {
						console.log(findScope(nextTokenValue));
						console.log(findScope(currentTokenValue));
						if (findScope(nextTokenValue) >= findScope(currentTokenValue)) {
							//semanticAnalysisError = "scope error on line " + tokens[parseIndex3][2];
						} else {
							semanticAnalysisError = "scope error on line " + tokens[parseIndex3][2];
						}
						// correct type
					}
				}	
			} else if (tokens[parseIndex3+1][1] === ")") {
				// correct type	
			} else if (nextTokenValue === '"') {
				semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2] + " expecting an int";
			}	 	
			// } else {
			// 	console.log(currentTokenValue);
			// 	console.log(nextTokenValue);
			// 	semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2] + " expecting an int";
			// }
		} else if (variableType === "string") {
			if (nextTokenValue === '"') {
				// correct type
			} else if (chars.indexOf(nextTokenValue) > -1) {
				if (tokens[parseIndex3+1][1] === "==" || tokens[parseIndex3+1][1] === "!=" || tokens[parseIndex3+1][1] === "+" || tokens[parseIndex3+1][1] === "=") {
					if (findType(nextTokenValue) !== "string") { 
						semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2] +" expecting a string";
					} else {
						if (findScope(nextTokenValue) > findScope(currentTokenValue)) {
							semanticAnalysisError = "scope error on line " + tokens[parseIndex3][2];
						}
						// correct type
					}
				}	
			} else if (tokens[parseIndex3+1][1] === ")") {
				// correct type	 	
			} else if (currentTokenValue === ")") {
				// correct type
			}	
			// } else {
			// 	semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2] +" expecting a string";
			// }
		} else if (variableType === "boolean") {
			if (nextTokenValue === "true" || nextTokenValue === "false" || nextTokenValue === "(") {
				// correct type
			} else if (chars.indexOf(nextTokenValue) > -1) {
				if (findType(nextTokenValue) !== "boolean") {
					semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2] + " expecting a boolean";
				} else {
					if (findScope(nextTokenValue) > findScope(currentTokenValue)) {
						semanticAnalysisError = "scope error on line " + tokens[parseIndex3][2];
					}
					// correct type
				}
			} else if (tokens[parseIndex3+1][1] === ")") {
				// correct type	
			} else {
				semanticAnalysisError = "type mismatch on line " + tokens[parseIndex3][2] + " expecting a boolean";
			}
		}
	}	

}


function undeclaredIDs() {
	if (chars.indexOf(currentTokenValue) > -1) {
		var i = 0;
		while (i < tokens.length) {
			if (tokens[i][1] === currentTokenValue && tokens[i+1][1] === "=") {
				return true;
			}
			i++;
		}
		return false;
	}
	return true;	
}

 
function unusedIDs() {
	var i = 1;
	while (i < identifiers.length) {
		if (chars.indexOf(identifiers[i]) > -1) {
			var j = 0;
			var counter = 0;
			while (j < tokens.length) {
				if (tokens[j][1] === identifiers[i] && tokens[j+1][1] === "=") {
					counter++;
				} 				
				j++;
			}
			if (counter === 0) {
				semanticAnalysisWarnings[warningCounter] = identifiers[i] + " was declared but not used";
				warningCounter++;
			}	
		}
		i = i + 4;
	}
}


function displayParse3Outcome() {
	if (semanticAnalysisError === "") {
		document.getElementById("output").innerHTML += '<p>Semantic Analysis Completed for program '+programCounter+' with no errors and '+semanticAnalysisWarnings.length+' warning(s)</p>';
		if (semanticAnalysisWarnings.length > 0) {
			var i = 0;
			while (i < semanticAnalysisWarnings.length) {
				document.getElementById("output").innerHTML += '<p>'+semanticAnalysisWarnings[i]+'</p>';
				i++;
			}	
		}
		document.getElementById("output").innerHTML += '<p>------------------------------------</p>';	
	} else {
		document.getElementById("output").innerHTML += '<p>Semantic Analysis Completed for program '+programCounter+' with an error:</p>';
		document.getElementById("output").innerHTML += '<p>'+semanticAnalysisError+'</p>';
		document.getElementById("output").innerHTML += '<p>Symbol table was not constructed</p>';
		document.getElementById("output").innerHTML += '<p>------------------------------------</p>';
	}	 
}


function displaySymbolTable() {
	var i = 0
	while (i < identifiers.length) {
		var table = document.getElementById("symbolTable");
		var row = table.insertRow(rowNum);
		var cell1 = row.insertCell(0); // symbol
		var cell2 = row.insertCell(1); // type
		var cell3 = row.insertCell(2); // scope
		var cell4 = row.insertCell(3); // line number
		var cell5 = row.insertCell(4); // program
		cell1.innerHTML = identifiers[i+1];
		cell2.innerHTML = identifiers[i];
		cell3.innerHTML = identifiers[i+2];
		cell4.innerHTML = identifiers[i+3];
		cell5.innerHTML = programCounter;
		rowNum++;
		i = i + 4;
	}
}






