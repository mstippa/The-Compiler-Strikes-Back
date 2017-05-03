/*
* This file takes the AST and generates	6502a machine code
*/ 

var generatedCode = [];
var lineCode = [];
var staticTable = [];
var staticTableCounter = 0;
var tempCounter = -1; // -1 instead of 0 because of the base case


function addCode () {
	if (generatedCode.length === 0) {
		generatedCode = lineCode;
	} else {
		generatedCode = generatedCode.concat(lineCode);
	}
}


function generateCode() {
	var i = 0;
	while (i < astTree.numRootChildren()) {
		var nodeName = astTree.getBranchNode();
		if (nodeName === "VarDecl") {
			tempCounter++;
			lineCode = ["A9","00","8D","T"+tempCounter, "XX"];
			addCode();
			staticTable[staticTableCounter] = ["T"+tempCounter+"XX", astTree.getLeafNode(), 0];
		} else if (nodeName === "Assign") {
			lineCode = ["A9","0"+astTree.getLeafNode(), "8D", "T"+tempCounter,"XX"];
			addCode();
		}
		i++;
	}
	generatedCode = generatedCode.concat("00");
	staticVariables();	
}

// finds the static position in hexadecimal
function findStaticPosition(codeLength) {
	var staticPosition = codeLength.toString(16);
	if (staticPosition.length < 2) {
		staticPosition = "0" + staticPosition;
		return staticPosition;
	} else {
		return staticPosition;
	}
}

// replaces all the temporary addresses with static addresses 
function staticVariables() {
	var codeLength = generatedCode.length+1; // add one more to the length of the code to find the start of the static area
	var staticPositionHex = findStaticPosition(codeLength);
	var i = 0;
	while (i <= tempCounter) {
		var j = 0;
		while (j < codeLength) {
			if (generatedCode[j] === "T"+i) {
				generatedCode[j] = staticPositionHex;
				generatedCode[j+1] = "00";
			}
			j++;
		}
		codeLength++;
		staticPositionHex = findStaticPosition(codeLength);
		i++;
	}
	console.log(generatedCode);
}

















