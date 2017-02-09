/*
* The purpose of the lexer is to take input characters and turn them into tokens which get sent to the parser
* 
*/

// global variables
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
var lineCounter = 1;

function compileBtnClick() {
	init();
	input = document.getElementById('sourceCode').value; // get the source file
	input = input.replace(/^\s+|\s+$/g, ""); // this removes the leading and trailing spaces
	findTokens();
	displayTokens();
}

// clears output box and resets global variables
function init() {
	possibleKeyword = "";
	currentToken = "";
	index = 0;
	input = "";
	tokenName = "";
	lineCounter = 1;
	console.log(lineCounter);
	tokens = [];
	document.getElementById("output").innerHTML = "";
}



function findTokens() {
	while (index < input.length) {
		console.log(lineCounter);
		currentToken = input[index];
		nexttoken = input[index+1];
			// testing if current token is a character 
			if (chars.indexOf(currentToken) > -1){
				if (specialCharacters.indexOf(nexttoken) > -1 || (nexttoken === undefined) || nexttoken === "\n") {
					tokens[index] = ["token_id", currentToken, lineCounter];
					index++;
				} else if (chars.indexOf(nexttoken) > -1) {
					validKeyword();
				} else {
					tokens[index] = [currentToken+nexttoken,"invalid lexeme", lineCounter];
					index = index + 2;
				}	
			// testing if current token is a digit	
			} else if (digits.indexOf(currentToken) > -1) {
				if(specialCharacters.indexOf(nexttoken) > -1 || (nexttoken === undefined && input.length-1 === index) || nexttoken === "\n") {
					tokens[index] = ["token_digit", currentToken, lineCounter];
					index++;
				} else {
					tokens[index] = [currentToken+nexttoken,"invalid lexeme", lineCounter];
					index = index + 2;
				}
			// testing if current token is a special character 
			} else if (specialCharacters.indexOf(currentToken) > -1) {
				if (currentToken === " ") {
					index++
				} else if (currentToken === "=" && nexttoken === "=") {
					tokens[index] = ["token_doubleEquals", currentToken+nexttoken, lineCounter];
					index = index + 2;
				} else if (currentToken === "$") {
					tokens[index] = ["token_"+specialCharNames[specialCharacters.indexOf(currentToken)],currentToken, lineCounter]

					index++;	
				} else {
					tokens[index] = ["token_"+specialCharNames[specialCharacters.indexOf(currentToken)],currentToken, lineCounter];
					index++;
				}
			// testing if token is not equals to 	
			} else if (currentToken === "!") {
				if (nexttoken === "=") {
					tokens[index] = ["token_notequals", currentToken+nexttoken, lineCounter];
					index = index + 2;
				} else {
					tokens[index] = [currentToken+nexttoken,"invalid lexeme", lineCounter];
					index++;
				}
			} else if (currentToken === "\n") {
				index++;
				lineCounter++;
			} else {
				tokens[index] = [currentToken,"invalid lexeme", lineCounter];
				index++
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
		if(specialCharacters.indexOf(truncatedInput[keywordIndex]) > -1 || (truncatedInput[keywordIndex] === undefined && truncatedInput.length === possibleKeyword.length) || (truncatedInput[keywordIndex] === "\n")) {
			tokens[index] = ["token_"+possibleKeyword, possibleKeyword, lineCounter];
			index = index + possibleKeyword.length;
		} else {
			tokens[index] = [possibleKeyword+truncatedInput[keywordIndex], "invalid lexeme", lineCounter];
			index = index + (possibleKeyword+truncatedInput[keywordIndex]).length;
		}
	} else {
		tokens[index] = [possibleKeyword, "invalid lexeme", lineCounter];
		index = index + possibleKeyword.length;
	}

}

function displayTokens() {
	var index = 0;
	var errorCounter = 0;
	var programCounter = 0;
	while (index < tokens.length) {
		if (tokens[index] === undefined) {
			index++;
		} else if (tokens[index][1] === "invalid lexeme") {
			document.getElementById("output").innerHTML += '<p>Invalid Lexeme: '+tokens[index][0]+' at line '+tokens[index][2]+'</p>';
			errorCounter++;
			index++;
		} else if (tokens[index][1] === "$") {
			programCounter++;
			document.getElementById("output").innerHTML += '<p>token: '+tokens[index][0]+' value: '+tokens[index][1]+'</p>';
			document.getElementById("output").innerHTML += '<p>Lex completed for program '+programCounter+ ' with '+errorCounter+' errors</p>';
			document.getElementById("output").innerHTML += '<p>---------------------------------------------------------------------------------</p>';
			index++;
			errorCounter = 0;
		} else {
			document.getElementById("output").innerHTML += '<p>token: '+tokens[index][0]+' value: '+tokens[index][1]+' at line '+tokens[index][2]+'</p>';
			index++;
		} if (tokens[tokens.length-1][1] !==  "$" && index === tokens.length) {
			document.getElementById("output").innerHTML += '<p>End of file token not found, but lex still completed with '+errorCounter+' errors</p>';
		}	

	}

}

