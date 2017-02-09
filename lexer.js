/*
* The purpose of the lexer is to take input characters and turn them into tokens which get sent to the parser
* 
*/

// globla variables
var tokens = [];
var specialCharacters = [" ","{","}","(",")",'"',"=","+","$"];
var specialCharNames = ["space","lbrace", "rbrace","lparen","rparen","quote","equals","intop","eof"];
var chars = "abcdefghijklmnopqrstuvwxyz";
var keywords = ["if", "int","true","false","while","print","string","boolean"];
var possibleKeyword ="";
var endFile = "$";
var digits = ["0","1","2","3","4","5","6","7","8","9"];
var currentToken = "";
var index = 0; 
var input = "";
var tokenName = "";

function compileBtnClick() {
	input = document.getElementById('sourceCode').value; // get the source file
	input = input.replace(/^\s+|\s+$/g, ""); // this removes the leading and trailing spaces
	findTokens();
	displayTokens();
}


function findTokens() {
	console.log(input.length);
	while (index < input.length) {
		console.log(index);
		currentToken = input[index];
		console.log(currentToken);
		nexttoken = input[index+1];
			// testing if current token is a character 
			if (chars.indexOf(currentToken) > -1){
				if (specialCharacters.indexOf(nexttoken) > -1 || (nexttoken === undefined) || nexttoken === "\n") {
					tokens[index] = ["token_id", currentToken];
					index++;
				} else if (chars.indexOf(nexttoken) > -1) {
					validKeyword();
				} else {
					tokens[index] = [currentToken+nexttoken,"invalid lexeme"];
					index++;
				}	
			// testing if current token is a digit	
			} else if (digits.indexOf(currentToken) > -1) {
				console.log("found a digit");
				if(specialCharacters.indexOf(nexttoken) > -1 || (nexttoken === undefined && input.length === 1) || nexttoken === "\n") {
					tokens[index] = ["token_digit", currentToken];
					index++;
				} else {
					tokens[index] = [currentToken+nexttoken,"invalid lexeme"];
					index++;
				}
			// testing if current token is a special character 
			} else if (specialCharacters.indexOf(currentToken) > -1) {
				console.log("found a separator");
				if (currentToken === " ") {
					index++
				} else if (currentToken === "=" && nexttoken === "=") {
					tokens[index] = ["token_doubleEquals", currentToken+nexttoken];
					index = index + 2;
				} else if (currentToken === "$") {
					tokens[index] = ["token_"+specialCharNames[specialCharacters.indexOf(currentToken)],currentToken]

					index++;	
				} else {
					tokens[index] = ["token_"+specialCharNames[specialCharacters.indexOf(currentToken)],currentToken];
					index++;
				}
			// testing if token is not equals to 	
			} else if (currentToken === "!") {
				if (nexttoken === "=") {
					tokens[index] = ["token_notequals", currentToken+nexttoken];
					index = index + 2;
				} else {
					tokens[index] = [currentToken+nexttoken,"invalid lexeme"];
					index++;
				}
			} else if (currentToken === "\n") {
				index++;
				continue;
			} else {
				tokens[index] = [currentToken,"invalid lexeme"];
			}	
	}
}

// checks to see if continuous characters make up a keyword
function validKeyword() {
	var truncatedInput = input.slice(index);
	possibleKeyword = truncatedInput.match(/.+?\b/);
	possibleKeyword = possibleKeyword[0];
	var keywordIndex = possibleKeyword.length;
	if (keywords.indexOf(possibleKeyword) > -1) {
		console.log("found a word");
		if(specialCharacters.indexOf(truncatedInput[keywordIndex]) > -1 || (truncatedInput[keywordIndex] === undefined && input.length === possibleKeyword.length) || (truncatedInput[keywordIndex] === "\n")) {
			tokens[index] = ["token_"+possibleKeyword, possibleKeyword];
			index = index + possibleKeyword.length;
			console.log(index);
		} else {
			tokens[index] = [possibleKeyword+truncatedInput[keywordIndex], " invalid lexeme"];
			index = index + (possibleKeyword+truncatedInput[keywordIndex]).length;
		}
	} else {
		tokens[index] = [possibleKeyword, " invalid lexeme"];
		index = index + possibleKeyword.length;
	}

}

function displayTokens() {
	var index = 0;
	var errorCounter = 0;
	while (index < tokens.length) {
		if (tokens[index][1] === "invalid lexeme") {
			document.getElementById("output").inner += '<p>Invalid Lexeme: '+tokens[index][0]+'</p>';
			errorCounter++;
		} else if (tokens[index][1] === "$") {
			document.getElementById("output").innerHTML += '<p>token: '+tokens[index][0]+' value: '+tokens[index][1]+'</p>';
			document.getElementById("output").innerHTML += '<p>Lex completed with '+errorCounter+' errors</p>';
			index++;
			errorCounter = 0;
		} else {
			document.getElementById("output").innerHTML += '<p>token: '+tokens[index][0]+' value: '+tokens[index][1]+'</p>';
			index++;
		}	

	}

}

