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
	generateCode(); // generate the code with temporary addresses
	staticVariables(); // replace the temporary addresses
	displayCode(); // display the code
}


// adds the new line of codes to the executable image
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
	var nodeName = "";
	while (i < astTree.numRootChildren()) {
		nodeName = astTree.getBranchNodeOfRoot();
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
			} else if(astTree.getLeafNode2() === "+") {
				addition(nodeName);
			// if here then we have found an id
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
			console.log(astTree.getLeafNode1());
			// checking for a char
			if (chars.indexOf(astTree.getLeafNode1()) > -1 && astTree.getLeafNode1().length < 2) {
				idAddress = addressLookUp(astTree.getLeafNode1());
				lineCode = ["AC", idAddress,"XX", "A2", "01", "FF"];
				addCode();	
			} else if (astTree.getLeafNode1() === "+") {
				lineCode = addition(nodeName);
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

// displays the code
function displayCode() {
	var i = 0;
	while (i < generatedCode.length) {
		document.getElementById("codeGen").innerHTML += generatedCode[i] + " ";
		i++;
	}
}


function addition(branch) {
	if (branch === "print") {
		if (digits.indexOf(astTree.getIntop1(branch)) > -1 && digits.indexOf(astTree.getIntop2(branch)) > -1) {
			var num = parseInt(astTree.getIntop1(branch))+parseInt(astTree.getIntop2(branch));
			return ["A0","0"+num.toString(),"A2", "01", "FF"];
		}
	} else if (branch === "Assign") {
		idAddress = addressLookUp(astTree.getLeafNode1()); // get the iddress of the id we are updating
		// checking if id getting updated is also in the expr
		if (astTree.getLeafNode1() === astTree.getIntop1(branch) || astTree.getLeafNode1() === astTree.getIntop2(branch)) {
			tempCounter++;
			lineCode = ["AD", idAddress, "XX", "8D", "T"+tempCounter, "XX"]; // load the address of the id we are updating and store it in a new location
			// checking if a digit is the first part of the expr 
			if (digits.indexOf(astTree.getIntop1(branch)) > -1) {
				lineCode = lineCode.concat(["A9","0"+astTree.getIntop1(branch)]);
				lineCode = lineCode.concat(["6D", "T"+tempCounter,"XX", "8D", idAddress, "XX"]);
				addCode();
			// if here than the id is the first part of the expr	
			} else {
				lineCode = lineCode.concat(["AD","T"+tempCounter, "XX", ]);
			}
		}	
	}	
}

















