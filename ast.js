/*
* This file creates an Abstract Syntax Tree by reparsing the tokens
*/


// maybe create tokens used for just the ast


function parse2() {
	parseIndex = 0;
	if (parseErrors.length > 0) {
		// do nothing
	} else {
		parseBlock2();
		astTree.endChildren();
	}
}

function parseBlock2() {
	astTree.addNode("Block", "branch"); // create a Block branch node for the abstract syntax tree
	match();
	if (typeKeywords.indexOf(currentTokenValue) > 0) {
		parseVarDecl2();
	} else if (chars.indexOf(currentTokenValue) > 0) {
		parseAssignmentStatement2();
	} else if (currentTokenValue === "if") {
		parseIfStatement2();
	} else if (currentTokenValue === "while") {
		parseWhileStatement2();
	} else if (currentTokenValue === "{") {
		parseBlock2();
	}
}

