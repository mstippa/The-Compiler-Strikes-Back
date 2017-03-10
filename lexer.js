/*
* The purpose of the lexer is to take input characters and turn them into tokens which get sent to the parser
* 
*/

// global variables
var tokens = []; // tokens will be stored as arrays in this array
var specialCharacters = [" ","{","}","(",")",'"',"=","+","$"];
var specialCharNames = ["space","lbrace", "rbrace","lparen","rparen","quote","equals","intop","eof"];
var chars = "abcdefghijklmnopqrstuvwxyz";
var keywords = ["if", "int","true","false","while","print","string","boolean"];
var typeKeywords = ["int", "string", "boolean"];
var possibleKeywords ="";
var endFile = "$";
var digits = ["0","1","2","3","4","5","6","7","8","9"];
var currentToken = "";
var index = 0; 
var index = 0;
var input = "";
var tokenName = "";
var lineCounter = 1;
var quoteCounter = 0;
var programCounter = 0; // keeps track of the number of programs
var lexerErrorCounter = 0;
var lexFailed = false;
var startOfProgram = 0;


// scans through the input looking for valid tokens
function findTokens() {
	while (index < input.length) {
		currentToken = input[index]; // sets the current token as the current index in input
		nexttoken = input[index+1]; // sets the next token as the next index in input
			// testing if current token is a character 
			if (chars.indexOf(currentToken) > -1){
				// testing if nexttoken will make the current char a valid id
				if (specialCharacters.indexOf(nexttoken) > -1 || (nexttoken === undefined) || nexttoken === "\n") {
					tokens[index] = ["token_id", currentToken, lineCounter]; // passes token name, value, and current line at the current index in tokens
					index++;
				// tests if nexttoken is a char	
				} else if (chars.indexOf(nexttoken) > -1) {
					validKeyword();
				// if code reaches here then there is an invalid token
				} else {
					identifyInvalidLexeme()
					//tokens[index] = [currentToken+nexttoken,"invalid lexeme", lineCounter];
					//index = index + 2; // index gets incremented by 2 to account for the nexttoken
				}	
			// testing if current token is a digit	
			} else if (digits.indexOf(currentToken) > -1) {
				if(specialCharacters.indexOf(nexttoken) > -1 || (nexttoken === undefined && input.length-1 === index) || nexttoken === "\n") {
					tokens[index] = ["token_digit", currentToken, lineCounter];
					index++;
				} else {
					identifyInvalidLexeme();
					//tokens[index] = [currentToken+nexttoken,"invalid lexeme", lineCounter];
					//index = index + 2;
				}
			// testing if current token is a special character 
			} else if (specialCharacters.indexOf(currentToken) > -1) {
				if (currentToken === " ") {
					index++
				// testing if currenttoken is double equals	
				} else if (currentToken === "=" && nexttoken === "=") {
					tokens[index] = ["token_doubleEquals", currentToken+nexttoken, lineCounter];
					index = index + 2;
				// testing if currenttoken is the end of file token
				} else if (currentToken === "$") {
					tokens[index] = ["token_"+specialCharNames[specialCharacters.indexOf(currentToken)],currentToken, lineCounter];
					index++;
				} else if (currentToken === '"' && quoteCounter === 0) {
					tokens[index] = ["token_quote", currentToken, lineCounter];
					validateString();
					quoteCounter++;
				} else if (currentToken === '"' && quoteCounter === 1) {
					tokens[index] = ["token_quote", currentToken, lineCounter];
					index++;	
					quoteCounter = 0;
				// if code reachers here then token is one of the other special character tokens		
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
			// testing if currenttoken is a newline character 	
			} else if (currentToken === "\n") {
				index++;
				lineCounter++; // increment line counter
			// if code reachers here then currenttoken is an invalid lexeme	
			} else {
				tokens[index] = [currentToken,"invalid lexeme", lineCounter];
				index++
			}	
	}
}

// checks to see if continuous characters make up a keyword
function validKeyword() {
	var truncatedInput = input.slice(index); // removes everything before the current index from the input
	possibleKeyword = truncatedInput.match(/.+?\b/); // finds all continouous characters from current index
	possibleKeyword = possibleKeyword[0]; // match returns an array and the first thing in the array is continous set of characters
	var keywordIndex = possibleKeyword.length;
	// tests to see if continous set of characters makes up a keyword
	if (keywords.indexOf(possibleKeyword) > -1) {
		// tests to see if token after the continous set of characters will still make the possibleKeyword vailid
		if(specialCharacters.indexOf(truncatedInput[keywordIndex]) > -1 || (truncatedInput[keywordIndex] === undefined && truncatedInput.length === possibleKeyword.length) || (truncatedInput[keywordIndex] === "\n")) {
			tokens[index] = ["token_"+possibleKeyword, possibleKeyword, lineCounter];
			index = index + possibleKeyword.length; // makes index equal to the next character after the continous set of characters
		// if code reaches here then keyword was found but following tokens make it invalide
		} else {
			tokens[index] = [possibleKeyword+truncatedInput[keywordIndex], "invalid lexeme", lineCounter];
			index = index + (possibleKeyword+truncatedInput[keywordIndex]).length;
		}
	// if code reaches here then continous set of characters do not make a keyword	
	} else {
		tokens[index] = [possibleKeyword, "invalid lexeme", lineCounter];
		index = index + possibleKeyword.length;
	}

}

function validateString() {
	var truncatedInput = input.slice(index + 1);
	if (/"/.test(truncatedInput)) {
		var i = index;
		var n;
		var string = "";
		while (i < input.length) {
			n = input[i+1];
			if (n === '"') { 
				var j = 0;
				while (j < string.length+1) { 
					if (chars.indexOf(string[j]) > -1 || string[j] === " ") { 
						j++;
					} else if (string[j] === "\n") { 
						tokens[i] = ["\n", "newline character isn't a valid string character", lineCounter];
						index = index + string.length+1;
						break;
					} else if (string[j] === "$") {
						tokens[i] = ["string_end_file", "End of file character can't be in a string", lineCounter];
						index = index + string.length+1;
						break;
					} else if ((digits.indexOf(string[j]) > -1 || specialCharacters.indexOf(string[j]) > -1) && string[j] !== '"') {
						tokens[i] = ["invalid string", string, lineCounter];
						index = index + string.length+1;
						break;	
					} else {
						index++;
						var k = 0;
						while (k < string.length) {
							tokens[index] = ["token_char", string[k], lineCounter];
							index++;
							k++;
						}	
						break;
					}	
				}	
				break;
			} else if (n !== '"' && n !== undefined) {  
				string = string + n;
				i++;
			}	
		}	
	} else {
		tokens[index] = ["missing quote", lineCounter];
		if (/\$/.test(truncatedInput)) {
			index = index + truncatedInput.indexOf("$");
		} else {
			index = input.length;
		}
	}

}

// identifies an invalid lexeme 
function identifyInvalidLexeme() {
	var i = index; // a local index
	var n;
	var invalidLexeme = "";
	while (i < input.length) {
		currenttoken = input[i];
		n = input[i+1]
		// tests if the nexttoken is a character or digit which extends the lexeme
		if (chars.indexOf(n) > -1 || digits.indexOf(n) > -1) {
			invalidLexeme = invalidLexeme + currenttoken;
			i++;
		// if code reaches here then the next token is no longer a character of digit	
		} else {
			tokens[index] = [invalidLexeme+currenttoken,"invalid lexeme", lineCounter];
			index = i + 1; 
			break;
		}
	}

}

// this displays the tokens
function displayTokens() {
	programCounter = 0;
	lexerErrorCounter = 0;
	var index = 0;
	while (index < tokens.length) {
		// tests if there is a row in tokens that is undefined and it will be skipped over in that case
		if (tokens[index] === undefined) {
			tokens.splice(index,1);
		} else if (tokens[index][1] === "invalid lexeme" && tokens[index][0] === "") {
		// tests if token value in the value column of the tokens array is an invalid lexeme	
		} else if (tokens[index][1] === "invalid lexeme") {
			document.getElementById("output").innerHTML += '<p>Error, invalid Lexeme: '+tokens[index][0]+' at line '+tokens[index][2]+'</p>'; // displays the invalid lexem value and where it was found
			lexerErrorCounter++;
			tokens.splice(index, 1);
		// tests if token value in the value column of the tokens array is an end of file token
		} else if (tokens[index][1] === "$") {
			programCounter++; // update the program counter
			tokens[index][3] = programCounter; // add the program number as an attribute to the end of program token
			document.getElementById("output").innerHTML += '<p>token: '+tokens[index][0]+' value: '+tokens[index][1]+'</p>'; // displays the end of file token 
			document.getElementById("output").innerHTML += '<p>Lex completed for program '+programCounter+ ' with '+lexerErrorCounter+' errors</p>'; // displays the program number and number of errors
			document.getElementById("output").innerHTML += '<p>-----------------------------------------------------------------</p>';
			index++;
			if (lexerErrorCounter !== 0) {
				lexFailed = true;
				startOfProgram = index;
			} else {
				parsePrograms();
			}
			lexerErrorCounter = 0;
		// if here then display the other tokens
		} else if (tokens[index][0] === "\n") {
			document.getElementById("output").innerHTML += '<p>Error: '+tokens[index][1]+' at line '+tokens[index][2]+'</p>';
			lexerErrorCounter++;
			tokens.splice(index, 1);
		} else if (tokens[index][0] === "string_end_file") {
			document.getElementById("output").innerHTML += '<p>Error: '+tokens[index][1]+' at line '+tokens[index][2]+'</p>';
			lexerErrorCounter++;
			tokens.splice(index, 1);
		} else if (tokens[index][0] === "invalid string") {
			document.getElementById("output").innerHTML += '<p>'+tokens[index][1]+' is not a valid string at line '+tokens[index][2]+'</p>';	
			lexerErrorCounter++;
			tokens.splice(index, 1);
		} else if (tokens[index][0] === "missing quote") {
			document.getElementById("output").innerHTML += '<p>Error, program '+programCounter+' is missing quotes</p>';
			lexerErrorCounter++;
			tokens.splice(index, 1);
		} else {
			document.getElementById("output").innerHTML += '<p>token: '+tokens[index][0]+' value: '+tokens[index][1]+' at line '+tokens[index][2]+'</p>';
			tokens[index][3] = programCounter;
			index++;
		// tests to see if the token value in the last array of tokens is an end of the file token	
		} if (tokens[tokens.length-1][1] !==  "$" && index === tokens.length) {
			programCounter++;
			tokens[index] = ["token_eof","$", lineCounter, programCounter];
			document.getElementById("output").innerHTML += '<p>End of file token not found, but lex still completed with '+lexerErrorCounter+' errors</p>'; // displays a warning message
			document.getElementById("output").innerHTML += '<p>-----------------------------------------------------------------</p>';
			parsePrograms();
			index++;
			lexerErrorCounter = 0;
		}	

	}

}

