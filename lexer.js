/*
* The purpose of the lexer is to take input characters and turn them into tokens which get sent to the parser
* 
*/


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

function btnClick() {
	input = document.getElementById('sourceCode').value; // get the source file
	input = input.replace(/^\s+|\s+$/g, ""); // this removes the leading and trailing spaces
	findTokens();
	console.log(tokens[0]+ "    " + tokens[1]);
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
				console.log("found a character");
				if (specialCharacters.indexOf(nexttoken) > -1 || (nexttoken === undefined && input.length === 1) || nexttoken === "\n") {
					tokens[index] = ["token_id", currentToken];
				} else if (chars.indexOf(nexttoken) > -1) {
					validKeyword();
					continue;
				} else {
					console.log(currentToken+nexttoken + " is not a valid lexeme");
				}
				index++;	
			// testing if current token is a digit	
			} else if (digits.indexOf(currentToken) > -1) {
				console.log("found a digit");
				if(specialCharacters.indexOf(nexttoken) > -1 || (nexttoken === undefined && input.length === 1) || nexttoken === "\n") {
					tokens[index] = ["token_digit", currentToken];
				} else {
					console.log("not a valid digit");
				}
				index++;
			// testing if current token is a special character 
			} else if (specialCharacters.indexOf(currentToken)) {
				console.log("found a separator");
				if (currentToken === " ") {
					// do nothing
				} else if (currentToken === "=" && nexttoken === "=") {
					tokens[index] = ["token_doubleEquals", currentToken+nexttoken];
					index = index + 2;
					continue;
				} else {
					tokenName = tokenName+(specialCharNames[specialCharacters.indexOf(currentToken)]); 
					tokens[index] = ["token_"+tokenName,currentToken];
				}
				index++;
			// testing if token is not equals to 	
			} else if (currentToken === "!") {
				if (nexttoken === "=") {
					tokens[index] = ["token_notequals", currentToken+nexttoken];
					index = index + 2;
					continue;
				} else {
					console.log("not a valid lexeme");
				}
			} else if (currentToken === "\n") {
				index++;
				continue;
			} else {
				console.log("not a valid lexeme");
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
		if(specialCharacters.indexOf(truncatedInput[keywordIndex]) > -1 || (truncatedInput[keywordIndex] === undefined && input.length === possibleKeyword.length)) {1
			tokens[index] = ["token_"+possibleKeyword, possibleKeyword];
			index = index + possibleKeyword.length;
			console.log(index);
		} else {
			console.log(possibleKeyword+keywordIndex + " is not a lexeme");
			index = index + (possibleKeyword+keywordIndex).length;
		}
	} else {
		console.log(possibleKeyword + " is not a lexeme");
		index = index + possibleKeyword.length;
	}

}

