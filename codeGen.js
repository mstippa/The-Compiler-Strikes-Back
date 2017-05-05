/*
* This file takes the AST and generates	6502a machine code
*/ 

// global variables
var generatedCode = [];
var lineCode = [];
var staticTable = [];
var staticTableCounter = 0;
var tempCounter = -1; // -1 instead of 0 because of the base case
var idAddress = "";


function driver() {
	generateCode();
	staticVariables();
}



function addCode () {
	if (generatedCode.length === 0) {
		generatedCode = lineCode;
	} else {
		generatedCode = generatedCode.concat(lineCode);
	}
}

// generates the code
function generateCode() {
	var i = 0;
	while (i < astTree.numRootChildren()) {
		var nodeName = astTree.getBranchNode();
		if (nodeName === "VarDecl") {
				tempCounter++;
				lineCode = ["A9","00","8D","T"+tempCounter, "XX"];
				addCode();
				staticTable[staticTableCounter] = ["T"+tempCounter, astTree.getLeafNode2(), astTree.getLeafNode1(), 0];
				staticTableCounter++;
		} else if (nodeName === "Assign") {
			// checking for a digit
			if (digits.indexOf(astTree.getLeafNode2()) > -1) {
				lineCode = ["A9","0"+astTree.getLeafNode2(), "8D", "T"+tempCounter,"XX"];
				addCode();
			// if here then we have not found a digit
			} else {
				var n = 0;
				// looping to find the temporary address of an identifier, only looking for ids at the moment
				while (n < staticTable.length) {
					if (staticTable[n][1] === astTree.getLeafNode2() && staticTable[n][2] === "int") {
						idAddress = addressLookUp(astTree.getLeafNode1());
						lineCode = ["AD", staticTable[n][0], "XX", "8D", idAddress, "XX" ];
						addCode();	
					}
					n++;
				}
			}
		} else if (nodeName === "print") {
			// checking for a char
			if (chars.indexOf(astTree.getLeafNode1()) > -1 && astTree.getLeafNode1().length < 2) {
				idAddress = addressLookUp(astTree.getLeafNode1());
				lineCode = ["AC", idAddress,"XX", "A2", "01", "FF"];
				addCode();	
			}		
		}
		i++;
	}
	generatedCode = generatedCode.concat("00");
	//console.log(generatedCode);	
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
	document.getElementById("codeGen").innerHTML += generatedCode;
}


// returns the temporary address of an id
function addressLookUp(id) {
	var m = 0;
	while (m < staticTable.length) {
		if (staticTable[m][1] === astTree.getLeafNode1()) {
			return staticTable[m][0];
		}
		m++;	
	}
}

















