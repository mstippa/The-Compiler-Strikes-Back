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
var nodeName = "";
var heapCode = ["00"];
var codGenScope = 0;
var string = "";
var convertedStringArray = [];
var xregisterCounter = 1;
var codeGenScope = 0;
var lineCodeLength = 0;
var stringLocation = 0;


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
			lineCodeLength = lineCode.length;
			addCode();
			staticTable[staticTableCounter] = ["T"+tempCounter, astTree.getLeafNode2(), astTree.getLeafNode1(), codeGenScope];
			staticTableCounter++;
		} else if (astTree.getLeafNode1() === "string" || "boolean") {
			tempCounter++;
			staticTable[staticTableCounter] = ["T"+tempCounter, astTree.getLeafNode2(), astTree.getLeafNode1(), codeGenScope];
			staticTableCounter++;
		}
		nodeName = astTree.getBranchNodeOfRoot();	
		generateCode();
	} else if (nodeName === "Assign") {
		// checking for a digit
		if (digits.indexOf(astTree.getLeafNode2()) > -1) {
			idAddress = addressLookUp(astTree.getLeafNode1())
			lineCode = ["A9","0"+astTree.getLeafNode2(), "8D", idAddress,"XX"];
			addValueToStaticTable(astTree.getLeafNode1(),astTree.getLeafNode2()); // add the value to the static table
			lineCodeLength = lineCodeLength + lineCode.length;
			addCode();
		} else if(astTree.getLeafNode2() === "+") {
			addition(nodeName);
		// if here then we have found an id
		} else if (chars.indexOf(astTree.getLeafNode2()) > -1 && astTree.getLeafNode2().length < 2) {
			var n = 0;
			// looping to find the temporary address of an identifier
			while (n < staticTable.length) {
				if (staticTable[n][1] === astTree.getLeafNode2() /*&& staticTable[n][2] === "int"*/) {
					idAddress = addressLookUp(astTree.getLeafNode1());
					lineCode = ["AD", staticTable[n][0], "XX", "8D", idAddress, "XX" ];
					lineCodeLength = lineCodeLength + lineCode.length;
					addCode();	
				}
				n++;
			}	
		// if here then we have a boolean or a string	
		} else {
			string = astTree.getLeafNode2();
			convertedStringArray = replaceString(string);
			stringToHeap(); // add the string to the heap array
			stringLocation = addHeapToGeneratedCode(); // add what's in the heap array to the generated code and the location of the start of the array is returned
			stringLocation = stringLocation.toString(16); // convert to hex
			stringLocation = stringLocation.toUpperCase(); // make it uppercase
			heapCode = ["00"]; // reset the heap array
			idAddress = addressLookUp(astTree.getLeafNode1());
			console.log(idAddress);
			lineCode = ["A9", stringLocation, "8D", idAddress, "XX"];
			lineCodeLength = lineCodeLength + lineCode.length;
			addCode();
		}
		nodeName = astTree.getBranchNodeOfRoot();
		generateCode();
	} else if (nodeName === "print") {
		// checking for a char
		if (chars.indexOf(astTree.getLeafNode1()) > -1 && astTree.getLeafNode1().length < 2) {
			idAddress = addressLookUp(astTree.getLeafNode1());
			if (typeLookUp(astTree.getLeafNode1()) === "int") {
				lineCode = ["AC", idAddress,"XX", "A2", "01", "FF"];
				lineCodeLength = lineCodeLength + lineCode.length;
			} else {
				lineCode = ["AC", idAddress,"XX", "A2", "02", "FF"];
				lineCodeLength = lineCodeLength + lineCode.length;
			}
			addCode();	
		} else if (astTree.getLeafNode1() === "+") {
			lineCode = addition(nodeName);
			lineCodeLength = lineCodeLength + lineCode.length;
			addCode();
		// checking for a digit	
		} else if (digits.indexOf(astTree.getLeafNode1()) > -1) {
			lineCode = ["A0", "0"+astTree.getLeafNode1(),"A2", "01", "FF"];
			lineCodeLength = lineCodeLength + lineCode.length;
			addCode();
		// checking for a string
		} else if (astTree.getLeafNode1().length > 1) {
			string = astTree.getLeafNode1();
			convertedStringArray = replaceString(string);
			stringToHeap(); // add the string to the heap array
			stringLocation = addHeapToGeneratedCode(); // add what's in the heap array to the generated code and the location of the start of the array is returned
			stringLocation = stringLocation.toString(16); // convert to hex
			stringLocation = stringLocation.toUpperCase(); // make it uppercase
			heapCode = ["00"]; // reset the heap array
			lineCode = ["A0", stringLocation, "A2", "02", "FF"];
			lineCodeLength = lineCodeLength + lineCode.length;
			addCode();
		}
		nodeName = astTree.getBranchNodeOfRoot();
		generateCode();		
	} else if (nodeName === "if") {
		// checking if the first part of the expr is a char
		if (chars.indexOf(astTree.getIntop1(nodeName)) > -1 && chars.indexOf(astTree.getIntop2(nodeName)) > -1) {
			idAddress = addressLookUp(astTree.getIntop1(nodeName)); // get the address of the first id being compared
			lineCode = ["AE", idAddress, "XX"];
			lineCodeLength = lineCodeLength + lineCode.length;
			idAddress = addressLookUp(astTree.getIntop2(nodeName)); // get the address of the second id being compared
			lineCode = lineCode.concat(["EC",idAddress, "XX", "D0", "J"+jumpCounter.toString()]);
			lineCodeLength = lineCodeLength + lineCode.length;
			jumpCounter++;
			addCode();
			codeGenScope++;
			nodeName = astTree.getBranchNodeOfRoot();
			console.log(nodeName);
			generateCode();
			console.log(nodeName);
			calcJump(); // calculate the distance to jump
			lineCodeLength = 0;
		} else if (digits.indexOf(astTree.getIntop2(nodeName)) > -1 || digits.indexOf(astTree.getIntop1(nodeName)) > -1) {
			tempCounter++;
			if (digits.indexOf(astTree.getIntop2(nodeName)) > -1) {
				lineCode = ["A9", "0"+astTree.getIntop2(nodeName), "8D", "T"+tempCounter, "XX"];
				idAddress = addressLookUp(astTree.getIntop1(nodeName));
			} else {
				lineCode = ["A9", "0"+astTree.getIntop1(nodeName), "8D", "T"+tempCounter, "XX"];
				idAddress = addressLookUp(astTree.getIntop2(nodeName));
			}
			lineCode = lineCode.concat(["AE", idAddress, "XX", "EC", "T"+tempCounter, "XX", "D0", "J"+jumpCounter.toString()]);
			lineCodeLength = lineCodeLength + lineCode.length;
			jumpCounter++;
			addCode();
			codeGenScope++;
			nodeName = astTree.getBranchNodeOfRoot();
			generateCode();
			calcJump(); // calculate the distance to jump
			lineCodeLength = 0;
		}
	} else if (nodeName === "while") {
		whileBranch();
	} else if (nodeName === "Block") {
		codeGenScope++;
		nodeName = astTree.getBranchNodeOfRoot();
		console.log(nodeName);
		generateCode();
		// generateCode();
	} else if (nodeName === "branch done") {
		if (codeGenScope !== 0) {
			astTree.getPreviousBlock();
		}
			nodeName = astTree.getBranchNodeOfRoot();
			console.log(nodeName);
			generateCode();	
		// traversal of another block complete
	} else if (nodeName === "done") {
		// traversal complete
	}
	//console.log(generatedCode);	
}


function whileBranch() {
// checking if both things being compared are variables
	if (chars.indexOf(astTree.getIntop1(nodeName)) > -1 && chars.indexOf(astTree.getIntop2(nodeName)) > -1) {
		idAddress = addressLookUp(astTree.getIntop1(nodeName)); // get the address of the first id being compared
		tempCounter++;
		lineCode = ["AD", idAddress, "XX", "8D", "T"+(tempCounter),"XX"]; // store the id being compared in a new location
		idAddress = addressLookUp(astTree.getIntop2(nodeName)); // get the address of the second id being compared
		tempCounter++;
		lineCode = lineCode.concat(["AE", "T"+(tempCounter-1), "XX", "EC", idAddress, "XX" ]); // compare the first value to the second value
		addCode();
		lineCodeLength = lineCodeLength + lineCode.length;
		if (astTree.getLeafNode1() === "notEqual") {
			lineCode = ["A9", "00", "D0", "02"];
			addCode();
			tempCounter++;
			lineCode = ["A9", "01", "A2", "00", "8D", "T"+tempCounter, "XX", "EC", "T"+tempCounter, "XX", "D0", "J"+jumpCounter.toString()];
			lineCodeLength = lineCodeLength + lineCode.length;
			jumpCounter++;
			addCode();
			codeGenScope++;
			nodeName = astTree.getBranchNodeOfRoot();
			lineCodeLength = 0;
			generatedCode();
			var jumpForward = (generatedCode.length+1);
			jumpForward = 255 - jumpForward;
			lineCode = ["A9", "00", "8D", "T"+tempCounter, "XX", "A2", "01", "EC", "T"+tempCounter, "XX", "D0", jumpForward.toString(16).toUpperCase()];
			lineCodeLength = lineCodeLength + lineCode.length;
			addCode();
			calcJump();
			lineCodeLength = 0;	
		}
	// checking if the first part of the expr is a char and the second is a digit, need to work on a better system for tempCounter
	} else {
		if (chars.indexOf(astTree.getIntop1(nodeName)) > -1 && digits.indexOf(astTree.getIntop2(nodeName)) > -1 ) {
			idAddress = addressLookUp(astTree.getIntop1(nodeName));
			tempCounter++;
			lineCode = ["AD", idAddress, "XX", "8D", "T"+tempCounter, "XX"]; // store the id in another location
			tempCounter++;
			lineCode = lineCode.concat(["A9", "0"+astTree.getIntop2(nodeName).toString(), "8D", "T"+tempCounter, "XX"]); // store the constant
			lineCode = lineCode.concat(["AE", "T"+(tempCounter-1), "XX", "EC", "T"+tempCounter, "XX"]); // compare the values
			addCode();
			lineCodeLength = lineCodeLength + lineCode.length;
			if (astTree.getLeafNode1() === "notEqual") {
				lineCode = ["A9","00", "D0", "02"]; // test is supposed to be unequal, so jump ahead 2 if they are
				addCode();
				tempCounter++;
				lineCode = ["A9","01","A2", "00", "8D", "T"+tempCounter, "XX", "EC", "T"+tempCounter, "XX", "D0", "J"+jumpCounter.toString()];
				lineCodeLength = lineCodeLength + lineCode.length;
				jumpCounter++;
				addCode();
				codeGenScope++;
				nodeName = astTree.getBranchNodeOfRoot();
				lineCodeLength = 0;
				generateCode();
				var jumpForward = (generatedCode.length+1);
				jumpForward = 255 - jumpForward;
				lineCode = ["A9", "00", "8D", "T"+(tempCounter-2), "XX","A2", "01", "EC", "T"+(tempCounter-2), "XX", "D0", jumpForward.toString(16).toUpperCase()];
				lineCodeLength = lineCodeLength + lineCode.length;
				addCode();
				calcJump(); // calculate the distance to jump
				lineCodeLength = 0;
			}
		// still need to fix this	
		} else {
			idAddress = addressLookUp(astTree.getIntop1(nodeName));
			lineCode = ["AD",idAddress, "8D", "T"+tempCounter, "XX"]; // load the id, store it somewhere else
			addCode();
			tempCounter++;
			lineCode = ["A9", astTree.getIntop2(nodeName), "8D", "T"+tempCounter, "XX"]
			idAddress = addressLookUp(astTree.getIntop2(nodeName));
			lineCode = lineCode.concat(["AD", idAddress, "XX", "T"+tempCounter, "XX"]); // store the id in a new address
			lineCode = lineCode.concat(["AE", "T"+tempCounter, "XX", "EC", "T"+(tempCounter-1), "XX"]); // compare the values
			lineCodeLength = lineCodeLength + lineCode.length;
			addCode();
			if (astTree.getLeafNode1() === "!=") {
				lineCode = ["A9","00", "D0", "02"]; // test is supposed to be unequal, so jump ahead 2 if they are
				addCode();
				lineCode = ["A9","01","A2", "00", "8D", "T"+(tempCounter-1), "XX", "EC", "T"+(tempCounter-1), "XX", "D0", "J"+jumpCounter.toString()];
				lineCodeLength = lineCodeLength + lineCode.length;
				jumpCounter++;
				addCode();
				codeGenScope++;
				nodeName = astTree.getBranchNodeOfRoot();
				lineCodeLength = 0;
				generateCode();
				calcJump(); // calculate the distance to jump
				lineCodeLength = 0;
			}
		}	
	}
}	


function getValue(val) {
	var highestScope = -1;
	var p = 0;
	if (digits.indexOf(val) > -1) {
		return val
	} else {
		var i = 0;
		while (i < staticTable.length) {
			if (staticTable[i][1] === val1) {
				if (staticTable[i][3] === codeGenScope) {
					return staticTable[i][1];
				} else if (staticTable[i][3] > highestScope) {
					highestScope = staticTable[i][3];
					p = i;
				}
			}
			i++;
		}
		return staticTable[p][4];
	}
}


// adds a value for an id to the static table
function addValueToStaticTable(id, value) {
	var i = 0;
	var highestScope = -1;
	var p = 0;
	while (i < staticTable.length) {
		if (id === staticTable[i][1]) {
			if (staticTable[i][3] === codGenScope) {
				staticTable[i][4] = value;
				break;
			} else if (staticTable[i][3] > highestScope) {
				highestScope = staticTable[i][3];
				p = i;
			}
		}
		i++;
	}
	staticTable[p][4] = value;
}


// finds the static position in hexadecimal
function findStaticPosition(codeLength) {
	var staticPosition = codeLength.toString(16);
	if (staticPosition.length < 2) {
		staticPosition = "0" + staticPosition;
		return staticPosition.toUpperCase();
	} else {
		return staticPosition.toUpperCase();
	}
}

// finds ordinal values for characters in string and converts them to hexadecimal
function replaceString(string) {
	var heapString = [];
	var p = 0;
	// converts a string to hexadecimal and puts in into an array
	while (p < string.length) {
		heapString[p] = string.charCodeAt(p);
		heapString[p] = heapString[p].toString(16).toUpperCase();
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
		return y+1;
	// if here then strings have been added to the heap already
	} else {
		while (y > 0) {
			if (generatedCode[y] !== undefined) {
				// move back to the next location
			} else {
				var k = heapCode.length - 1;
				while (k >= 0) {
					generatedCode[y] = heapCode[k];
					y--;
					k--;
				}
				return y+1; 
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


// calculates the distance to jump 
function calcJump() {
	var jumpDistance = lineCodeLength;
	var i = 0;
	while (i < generatedCode.length) {
		if (generatedCode[i] === "J"+(jumpCounter-1)) {
			if (jumpDistance < 10) {
				generatedCode[i] = "0"+jumpDistance;
				break;
			} else {
				if (jumpDistance.toString(16).length > 1) {
					generatedCode[i] = jumpDistance.toString(16);
					break;
				} else {
					generatedCode[i] = "0"+jumpDistance.toString(16);
					break;
				}
			}
		}
		i++;
	}
}


// returns the temporary address of an id
function addressLookUp(id) {
	var m = 0;
	var highestScope = -1;
	var highestScopeId = "";
	while (m < staticTable.length) {
		if (staticTable[m][1] === id) {
			if (staticTable[m][3] === codeGenScope) {
				return staticTable[m][0];
			} else if (staticTable[m][3] > highestScope) {
				highestScope = staticTable[m][3];
				highestScopeId = staticTable[m][0];
			}	
		}
		m++;	
	}
	return highestScopeId;
}


// looks up the scope for an identifier 
function scopeLookUp(id) {

}

// looks up the type for an identifier
function typeLookUp(id) {
	var m = 0;
	while (m < staticTable.length) {
		if (staticTable[m][1] === id) {
			return staticTable[m][2];
		}
		m++;
	}
}


// fills in undefined indexes with 00
function fillInCode() {
	var i = 0;
	while (i < 256) {
		if (generatedCode[i] === undefined) {
			generatedCode[i] = "00";
		}
		i++;
	}
}


// displays the code
function displayCode() {
	if (generatedCode.length < 257) {
		var i = 0;
		while (i < generatedCode.length) {
			document.getElementById("codeGen").innerHTML += generatedCode[i] + " ";
			i++;
		}
		document.getElementById("output").innerHTML += '<p>Code Generation complete for program '+programCounter+'</p>';
	} else {
		document.getElementById("output").innerHTML += '<p>Stack overflow error for program '+programCounter+'. Code not generated</p>';
	}	
}

// generates the code when an intop is in the source code
function addition(branch) {
	if (branch === "print") {
		if (digits.indexOf(astTree.getIntop1(branch)) > -1 && digits.indexOf(astTree.getIntop2(branch)) > -1) {
			var num = parseInt(astTree.getIntop1(branch))+parseInt(astTree.getIntop2(branch));
			return ["A0","0"+num.toString(),"A2", "01", "FF"];
		} else if (chars.indexOf(astTree.getIntop1(branch)) > -1 || chars.indexOf(astTree.getIntop2(branch)) > -1) {
			if (chars.indexOf(astTree.getIntop2(branch)) > -1) {
				idAddress = addressLookUp(astTree.getIntop2(branch));
				tempCounter++;
				return ["A9", "0"+astTree.getIntop1(branch), "6D", idAddress, "XX", "8D", "T"+tempCounter, "XX", "AC", "T"+tempCounter, "XX", "A2", "01", "FF"];
			} 
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
				lineCodeLength = lineCodeLength + lineCode.length;
				addCode();
			// if here than the id is the first part of the expr	
			} else {
				lineCode = lineCode.concat(["AD","T"+tempCounter, "XX", ]);
				lineCodeLength = lineCodeLength + lineCodeLength;
				addCode();
			}
		}	
	}	
}

















