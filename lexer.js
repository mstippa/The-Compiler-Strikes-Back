/*
* The purpose of the lexer is to take input characters and turn them into tokens which get sent to the parser
* 
*/


var tokens = {
	token_id: [],
	token_int: [],

};



var correctSeparators = [" ","{","}","(",")",'"',"=","+","$"];
var separatorNames = ["space","lbrace", "rbrace","lbrace","rbrace","quote","equals","intop","eof"];
var chars = "abcdefghijklmnopqrstuvwxyz";
var keywords = ["if", "int","true","false","while","print","string","boolean"];
var possibleKeyword ="";
var endFile = "$";
var digits = ["0","1","2","3","4","5","6","7","8","9"];
var currentToken = "";
var index = 0; 
var input = "";

function sourceCode() {
	input = document.getElementById('sourceCode').value; // get the source file
	input = input.replace(/^\s+|\s+$/g, ""); // this removes the leading and trailing spaces
	findTokens();
	console.log(tokens);
}

function findTokens() {
	console.log("entered findTokens");
	currentToken=endFile;
	while (index < input.length) {
		console.log("entered while loop");
		currentToken = input[index];
		console.log(currentToken);
		nexttoken = input[index+1];
			// testing if current token is a character 
			if (chars.indexOf(currentToken) > -1){
				console.log("found a character");
				if (correctSeparators.indexOf(nexttoken) > -1 || nexttoken === undefined) {
					tokens.token_id.push(currentToken);
					index++;
				} else if (chars.indexOf(nexttoken) > -1) {
					validKeyword();
				} else {
					console.log("not a valid character");
				}
			index++;	
			// testing if current token is a digit	
			} else if (digits.indexOf(currentToken) > -1) {
				console.log("found a digit");
				if(correctSeparators.indexOf(nexttoken) > -1 || nexttoken === undefined) {
					tokens.token_int.push(currentToken);
					index++;
				} else {
					console.log("not a valid digit");
				}
				index++;
			// testing if current token is a separator 
			} else if (correctSeparators.indexOf(currentToken) > -1 || nexttoken === undefined) {
				console.log("found a separator");
				if (currentToken === " ") {
					index++;
				} else if (currentToken === "=" && nexttoken === "=") {
					tokens.token_doubleEquals = tokens.token_doubleEquals + (currentToken+nexttoken);
					index = index + 2;
				} else {
					tokenName = tokenName+(separatorNames[correctSeparators.indexOf(currentToken)]); 
					tokens.tokenName.push(currentToken);
					index++;
				}
				index++;
			// testing if token is not equals to 	
			} else if (currentToken === "!") {
				if (nexttoken === "=") {
					tokens.token_notEquals.push(currentToken+nexttoken);
					index = index + 2;
				} else {
					console.log("not a valid lexeme");
				}
			} else {
				console.log("not a valid lexeme");
			}
			index++;		
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
		if(correctSeparators.indexOf(truncatedInput[keywordIndex]) > -1 || truncatedInput[keywordIndex] === undefined) {
			console.log("sa");
			tokenName = "token_" + possibleKeyword;
			tokenName.push(possibleKeyword);
			index = index + possibleKeyword.length;
		} else {
			console.log("not a valid lexeme");
		}
	} else {
		console.log("not a valid lexeme");
	}

}

