/*
* This file takes the AST and generates	6502a machine code
*/ 

// global variables
var generatedCode = [];
var generatedCodeCounter = 0;
var lineCode = [];
var staticTable = [];
var staticTableCounter = 0;
var tempCounter = -1; // -1 instead of 0 because of the base case
var idAddress = "";
var jumpCounter = 0;
var jumpCounterArray = [];
var jumDistance = 0;
var nodeName = "";
var heapCode = ["00"];
var codGenScope = 0;
var string = "";
var convertedStringArray = [];


// driver function
function driver() {
	nodeName = astTree.getBranchNodeOfRoot();
	generateCode(); // generate the code with temporary addresses
	staticVariables(); // replace the temporary addresses
	fillInCode();
	displayCode(); // display the code
}


// adds the new line of codes to the executable image
function addCode () {
	var j = 0;
	while (j < lineCode.length) {
		generatedCode[generatedCodeCounter] = lineCode[j];
		generatedCodeCounter++;
		j++;
	}
	// 	if (generatedCode[0] === undefined) {
	// 		generatedCode = lineCode;
	// 	} else {
	// 		generatedCode = generatedCode.concat(lineCode);
	// 	}
	// }	
}

// generates the code
function generateCode() {
	if (nodeName === "VarDecl") {
		if (astTree.getLeafNode1() === "int") {
			tempCounter++;
			lineCode = ["A9","00","8D","T"+tempCounter, "XX"];
			addCode();
			staticTable[staticTableCounter] = ["T"+tempCounter, astTree.getLeafNode2(), astTree.getLeafNode1()];
			staticTableCounter++;
		} else if (astTree.getLeafNode1() === "string") {
			tempCounter++;
			staticTable[staticTableCounter] = ["T"+tempCounter, astTree.getLeafNode2(), astTree.getLeafNode1()];
		}
		nodeName = astTree.getBranchNodeOfRoot();	
		generateCode();
	} else if (nodeName === "Assign") {
		// checking for a digit
		if (digits.indexOf(astTree.getLeafNode2()) > -1) {
			lineCode = ["A9","0"+astTree.getLeafNode2(), "8D", "T"+tempCounter,"XX"];
			addCode();
		} else if(astTree.getLeafNode2() === "+") {
			addition(nodeName);
		// if here then we have found an id
		} else if (chars.indexOf(astTree.getLeafNode2()) > -1 && astTree.getLeafNode2().length < 2) {
			var n = 0;
			// looping to find the temporary address of an identifier
			while (n < staticTable.length) {
				if (staticTable[n][1] === astTree.getLeafNode2() && staticTable[n][2] === "int") {
					idAddress = addressLookUp(astTree.getLeafNode1());
					lineCode = ["AD", staticTable[n][0], "XX", "8D", idAddress, "XX" ];
					addCode();	
				}
				n++;
			}
		// if here then we have a boolean or a string	
		} else {
			// checking for a boolean
			if (astTree.getLeafNode2() === "true" || astTree.getLeafNode2() === "false") {

			// if here then we have a string
			} else {
				string = astTree.getLeafNode2();
				convertedStringArray = replaceString(string);
				stringToHeap(); // add the string to the heap array
				var stringLocation = addHeapToGeneratedCode(); // add what's in the heap array to the generated code and the location of the start of the array is returned
				stringLocation = stringLocation.toString(16); // convert to hex
				stringLocation = stringLocation.toUpperCase(); // make it uppercase
				heapCode = ["00"]; // reset the heap array
				idAddress = addressLookUp(astTree.getLeafNode1());
				lineCode = ["A9", stringLocation, "8D", idAddress, "XX"];
				addCode();
			}
		}
		nodeName = astTree.getBranchNodeOfRoot();
		generateCode();
	} else if (nodeName === "print") {
		// checking for a char
		if (chars.indexOf(astTree.getLeafNode1()) > -1 && astTree.getLeafNode1().length < 2) {
			idAddress = addressLookUp(astTree.getLeafNode1());
			lineCode = ["AC", idAddress,"XX", "A2", "01", "FF"];
			addCode();	
		} else if (astTree.getLeafNode1() === "+") {
			lineCode = addition(nodeName);
			addCode();
		}
		nodeName = astTree.getBranchNodeOfRoot(); 
		generateCode();		
	} else if (nodeName === "if") {
		// checking if the first part of the expr is a char
		if (chars.indexOf(astTree.getIntop1()) > -1) {
			idAddress = addressLookUp(astTree.getIntop1()); // get the address of the first id being compared
			lineCode = ["AE", idAddress, "XX", "EC"];
			// checking if the second part of the expr is a char
			if (chars.indexOf(astTree.getIntop2()) > -1) {
				idAddress = addressLookUp(astTree.getIntop2()); // get the address of the second id being compared
				lineCode = lineCode.concat([idAddress, "XX", "D0", "J"+jumpCounter.toString()]);
				jumpCounter++;
				addCode();
				generateCode();
			}	 
		}
		generateCode();
	} else if (nodeName === "done") {
		// traversal complete
	}
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

// finds ordinal values for characters in string and converts them to hexadecimal
function replaceString(string) {
	var heapString = [];
	var p = 0;
	// converts a string to hexadecimal and puts in into an array
	while (p < string.length) {
		heapString[p] = string.charCodeAt(p);
		heapString[p] = heapString[p].toString(16);
		p++;
	}
	return heapString;
}


function stringToHeap() {
	var k = convertedStringArray.length - 1;
	while (k >= 0) {
		heapCode.unshift(convertedStringArray[k]);
		k--;
	}
}

// this adds what is currently in the heap array to the generatedCode array
function addHeapToGeneratedCode() {
	var y = 255;
	// checking if any strings have been added to the heap yet
	if (generatedCode[y] === undefined) {
		var k = heapCode.length - 1;
		while (k > -1) {
			generatedCode[y] = heapCode[k];
			y--;
			k--;
		}
		console.log(generatedCode);
		return y;
	// if here then strings have been added to the heap already
	} else {
		while (y > 0) {
			if (generateCode[y].length === 2) {
				// move back to the next location
			} else {
				var k = heapCode.length - 1;
				while (k => 0) {
					generateCode[y] = heapCode[k];
					y--;
					k--;
				}
				return y; 
			}
			y--;
		}
	}
}

// replaces all the temporary addresses with static addresses 
function staticVariables() {
	var h = 0;
	var codeLength = 0;
	while (h < 255) {
		if (generatedCode[h] !== undefined) {
			// haven't found static area yet
		} else {
			generatedCode[h] = "00";
			h++;
			codeLength = h;
			break;
		}
		h++;
	}
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


function calcJump() {

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


function scopeLookUp(id) {

}


function typeLookUp(id) {

}


function fillInCode() {
	var i = 0;
	while (i < generatedCode.length) {
		if (generatedCode[i] === undefined) {
			generatedCode[i] = "00";
		}
		i++;
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

// generates the code when an intop is in the source code
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

















