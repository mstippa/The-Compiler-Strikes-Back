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
var keywords = ["if", "int",true,false,"while","print","string","boolean"];
var possibleKeyword ="";
var endFile = "$";
var digits = [0,1,2,3,4,5,6,7,8,9];
var currentToken = "";
var index = 0; 
var tokenName ="token_";

function sourceCode() {
	var input = document.getElementById('sourceCode').value; // get the source file
	input = input.replace(/^\s+|\s+$/g, ""); // this removes the leading and trailing spaces
	console.log(input);
	console.log(index);
	console.log(input.length);
	findTokens();
	console.log(tokens);
}


