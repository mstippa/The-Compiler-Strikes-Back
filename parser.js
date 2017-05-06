/*
* The parser takes the tokens from the lexer and sees if together, they create valid sentences 
*/

// global variables
var parseIndex = 0;
var currentTokenValue = "";
var nextTokenValue = "";
var eofCounter = 0;
var parseErrors = [];
var errorCounter = 0;
var cstTree = new Tree();
var astTree = new Tree();
var parseIndex2 = 0;
var currentNodeCounter = 0;
var branchNodeCounter = 0;
var newBranchNodeCounter = 0;
var newBlockCurrentNodeCounter = 0;

// updates the parseIndex
// moves the "pointer" ahead
function match() {
	parseIndex++;
	if (parseIndex < tokens.length && tokens[parseIndex] !== undefined) {
		currentTokenValue = tokens[parseIndex][1];
	} else {
		parseIndex--;
	}	
}

// starts the derivation of the source code
function parse () {
	document.getElementById("output").innerHTML += '<p>parse()</p>';
	if (lexFailed === false) {
		currentTokenValue = tokens[parseIndex][1]; // sets currentTokenValue equal to the value at the current index in tokens
	} else {
		parseIndex = startOfProgram;
		parseIndex2 = startOfProgram;
		parseIndex3 = startOfProgram;
		currentTokenValue = tokens[parseIndex][1];
	}	
	errorCounter = 0;
	cstTree = new Tree(); // creates a new cstTree object
	astTree = new Tree(); // creates a new astTree object
	parseProgram();
	cstTree.endChildren();
	displayParseOutcome();
	parse2();
	parse3();
	driver(); 
	if (currentTokenValue === "$" && tokens[parseIndex+1] !== undefined) {
		parseIndex++;
		parseIndex2++;
		parseIndex3++;
		parseErrors = [];
	} else {
		var i = parseIndex;
		while (i < tokens.length) {
			if (tokens[i][1] === "$") {
				parseIndex = i+1;
				parseIndex2 = i+1;
				parseIndex3 = i+1;
				parseErrors = [];
				break;
			}
			i++;
		}

	}
}

// program production
function parseProgram() {
	document.getElementById("output").innerHTML += '<p>parseProgram()</p>';
	cstTree.addNode("Program", "branch"); // create a Program branch node for concrete syntax tree
	parseBlock();
	//cstTree.endChildren(); // end the children aka we're done with this branch of the cstTree
	while (cstTree.traversalDepth > 0) {
		cstTree.endChildren();
		cstTree.traversalDepth--;
	}
	// if error was found then don't continue with the parse
	if (!parseErrors.length > 0) {
		// if end of file token was not found at this point in the parse then that's an error!
		if (currentTokenValue !== "$") {
			parseErrors = ["$", currentTokenValue];
		} else {
			cstTree.addNode("$", "leaf"); // create a end of file leaf node
		}
	} else {
		// do nothing
	}	
}

// block production
function parseBlock() {
	document.getElementById("output").innerHTML += '<p>parseBlock()</p>';
	cstTree.addNode("Block", "branch"); //create a Block branch node for the cst
	if (currentTokenValue === "{") {
		cstTree.addNode("{","leaf"); // create a { leaf node
		match();
		// checking for null pointer exception
		if (tokens.length > parseIndex) {
			// checking if statementList is equal to the empty set
			if (currentTokenValue === "}") {
				document.getElementById("output").innerHTML += '<p>parseStatementList()</p>';
				cstTree.addNode("StatementList", "branch"); // create a Statementlist branch node for concrete syntax tree
				cstTree.endChildren();
				cstTree.addNode("}", "leaf");
				cstTree.endChildren();
				match();
			// if statementList is not the empty set	
			} else {
				parseStatementList();
				if (!parseErrors.length > 0) {
					// if here then } should be the current token 
					if (currentTokenValue === "}") {
						if (tokens[parseIndex+1][1] === "$") {
							var treeDepth = cstTree.countDepth();
							while (treeDepth > 5) {
								cstTree.endChildren();
								treeDepth--;
							}
							cstTree.addNode("}","leaf");
							cstTree.endChildren();	
							match();
						} else {
							cstTree.endChildren();
							cstTree.addNode("}","leaf");	
							match();
						}	
					} else {
						parseErrors = ["}", currentTokenValue, tokens[parseIndex][2]];
						match();
					}
				} else {
					// do nothing, but we're really exiting function because error has been found
				}	
			}
		} else {
			parseErrors = ["StatementList", currentTokenValue, tokens[parseIndex-1][2]];
		}
	// if here then we did not get a {		
	} else {
		parseErrors = ["{", currentTokenValue, tokens[parseIndex][2]];
		match();
	}
}

// StatementList production
function parseStatementList() {
	if (currentTokenValue === "}" || currentTokenValue === null) {
	// do nothing!!		
	} else {
		document.getElementById("output").innerHTML += '<p>parseStatementList()</p>';
		cstTree.addNode("StatementList", "branch");
		parseStatement();
		cstTree.endChildren();
		// if there are no errors
		if (!parseErrors.length > 0) {
			parseStatementList();
		// error has been found	
		} else {
			// do nothing
		}	
	}
}

// Statement production
function parseStatement() {
	document.getElementById("output").innerHTML += '<p>parseStatement()</p>';
	cstTree.addNode("Statement", "branch");
	// printStatement production has been found
	if (currentTokenValue === "print") {
		parsePrintStatement();
		cstTree.endChildren();
	// assignmentStatement production has been found	
	} else if (chars.indexOf(currentTokenValue) > -1) {
		parseAssignmentStatement();
		cstTree.endChildren();
	// varDecl production has been found	
	} else if (typeKeywords.indexOf(currentTokenValue) > -1) {
		parseVarDecl();
		cstTree.endChildren();
	// whileStatement production has been found	
	} else if (currentTokenValue === "while") {
		parseWhileStatement();
		cstTree.endChildren();
	// ifStatement production has been found	
	} else if (currentTokenValue === "if") {
		parseIfStatement();
		cstTree.endChildren();
	// 	Block production has been found
	} else if (currentTokenValue === "{") {
		parseBlock();
		cstTree.endChildren();
	// if here then a statement has not been found	
	} else {
		parseErrors = ["Statement", currentTokenValue, tokens[parseIndex][2]];
		match();	
	}	
}

// PrintStatement production
function parsePrintStatement() {
	document.getElementById("output").innerHTML += '<p>parsePrintStatement()</p>';
	cstTree.addNode("PrintStatement", "branch");
	cstTree.addNode("print", "leaf");
	match();
	// if here than "(" is expected
	if (currentTokenValue === "(") {
		cstTree.addNode("(", "leaf");
		match();
		parseExpr();
		cstTree.endChildren();
		// needs to be clothing paren after Expr has been called
		if (currentTokenValue === ")") {
			cstTree.addNode(")", "leaf");
			cstTree.endChildren();
			match();
		// no closing paren	
		} else {
			parseErrors = [")", currentTokenValue, tokens[parseIndex][2]];
			match();
		}
	// no paren after the print keyword	
	} else {
		parseErrors = ["(", currentTokenValue, tokens[parseIndex][2]];
		match();
	}
}

// AssignmentStatement Production
function parseAssignmentStatement() {
	document.getElementById("output").innerHTML += '<p>parseAssignmentStatement()</p>';
	cstTree.addNode("AssignmentStatement", "branch");
	parseId();
	cstTree.endChildren();
	// "=" is expected after an id
	if (currentTokenValue === "=") {
		cstTree.addNode("=", "leaf");
		match();
		parseExpr();
		cstTree.endChildren();
	// no "=" was found	
	} else {
		parseErrors = ["=", currentTokenValue, tokens[parseIndex][2]];
		match();
	}	
}

// varDecl production
function parseVarDecl() {
	document.getElementById("output").innerHTML += '<p>parseVarDecl()</p>';
	cstTree.addNode("VarDecl", "branch");
	parseType(); // will check in type production if keyword is current token
	cstTree.endChildren();
	parseId(); // will check in id production if char is current token
	cstTree.endChildren();
}

// WhileStatement production
function parseWhileStatement() {
	document.getElementById("output").innerHTML += '<p>parseWhileStatement()</p>';
	cstTree.addNode("WhileStatement", "branch");
	cstTree.addNode("while", "leaf");
	match();
	parseBooleanExpr(); // booleanexpr is expected after while keyword
	cstTree.endChildren();
	// making sure there are no errors
	if (!parseErrors.length > 0) {
		parseBlock();
		cstTree.endChildren();
	// send it back!!!	
	} else {
		// do nothing
	}		
}

// IfStatement production
function parseIfStatement() {
	document.getElementById("output").innerHTML += '<p>parseIfStatement()</p>';
	cstTree.addNode("IfStatement", "branch");
	cstTree.addNode("if", "leaf");
	match();
	parseBooleanExpr(); // booleanexpr is expected after if keyword
	cstTree.endChildren();
	// checking for no errors
	if (!parseErrors.length > 0) {
		parseBlock();
		cstTree.endChildren();
	// if there are errors, send it back!!	
	} else { 
		// do nothing
	}	
}

// Expr production
function parseExpr() {
	document.getElementById("output").innerHTML += '<p>parseExpr()</p>';
	cstTree.addNode("Expr", "branch");
	// intexpr production has been found
	if (digits.indexOf(currentTokenValue) > -1) {
		parseIntExpr();
		cstTree.endChildren();
	// stringexpr production has been found
	} else if (currentTokenValue === '"') {
		parseStringExpr();
		cstTree.endChildren();
	// booleanexpr production has been found	
	} else if (currentTokenValue === "(" || currentTokenValue === "true" || currentTokenValue === "false") {
		parseBooleanExpr();
		cstTree.endChildren();
	// id production has been found	
	} else if (chars.indexOf(currentTokenValue) > -1) {
		parseId();
		cstTree.endChildren();
	// error!! Expecting expr but got something else	
	} else {
		parseErrors = ["Expr", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// IntExpr production
function parseIntExpr() {
	document.getElementById("output").innerHTML += '<p>parseIntExpr()</p>';
	cstTree.addNode("IntExpr", "branch");
	parseDigit(); // expecting a digit at this point
	cstTree.endChildren();
	// just making sure there are no errors
	if (!parseErrors.length > 0) {
		// expecting a intop
		if (currentTokenValue === "+") {
			parseIntOp();
			cstTree.endChildren();
			if (!parseErrors.length > 0) {
				parseExpr();
				cstTree.endChildren();
			} else {
				// do nothing
			}
		// "+" was not the current token		
		} else {
			// parseErrors = ["+", currentTokenValue, tokens[parseIndex][2]];
		}	
	// there is an error, send it back!!!
	} else {
		// do nothing
	}		
}

// StringExpr production
function parseStringExpr() {
	document.getElementById("output").innerHTML += '<p>parseStringExpr()</p>';
	cstTree.addNode("StringExpr", "branch");
	cstTree.addNode('"', "leaf");
	match();
	parseCharList(); // looking for charlist
	cstTree.endChildren();
	// if there are no errors
	if (!parseErrors.length > 0) {
		// expecting a "
		if (currentTokenValue === '"') {
			cstTree.addNode('"', "leaf");
			match();
		// didn't get a "	
		} else {
			parseErrors = ['"', currentTokenValue, tokens[parseIndex][2]];
		}
	// error was found	
	} else {
		// do nothing
	}	
}

// BooleanExpr production
function parseBooleanExpr() {
	document.getElementById("output").innerHTML += '<p>parseBooleanExpr()</p>';
	cstTree.addNode("BooleanExpr", "branch");
	// found a boolval production
	if (currentTokenValue === "true" || currentTokenValue === "false") {
		parseBoolVal();
		cstTree.endChildren();
	// found a paren	
	} else if (currentTokenValue === "(") {
		cstTree.addNode("(", "leaf");
		match();
		parseExpr();
		cstTree.endChildren();
		if (!parseErrors.length > 0) {
			parseBoolop();
			cstTree.endChildren();
			if (!parseErrors.length > 0) {
				parseExpr();
				cstTree.endChildren();
				if (!parseErrors.length > 0) {
					if (currentTokenValue === ")") {
						cstTree.addNode(")", "leaf");
						match();
					} else {
						parseErrors = [")", currentTokenValue, tokens[parseIndex][2]];
					}
				// error was found kick back	
				} else {
					// do nothing
				}
			// error was found kick back		
			} else {
				// do nothing
			}
		// error was found kick back		
		} else {
			// do nothing
		}	
	} else {
		parseErrors = ["BooleanExpr", currentTokenValue, tokens[parseIndex][2]];
	}
}

// Id production
function parseId() {
	document.getElementById("output").innerHTML += '<p>parseId()</p>';
	cstTree.addNode("Id", "branch");
	parseChar();
	cstTree.endChildren();
	cstTree.endChildren();
}

// Charlist production
function parseCharList() {
	// found a char production
	if (chars.indexOf(currentTokenValue) > -1) {
		document.getElementById("output").innerHTML += '<p>parseCharList()</p>';
		cstTree.addNode("CharList", "branch");
		parseChar();
		// cstTree.endChildren();
		if (!parseErrors.length > 0) {
			parseCharList();
			cstTree.endChildren();
		} else {
			// do nothing
		}	
	// found a space production	
	} else if (currentTokenValue === " ") {	
		document.getElementById("output").innerHTML += '<p>parseCharList()</p>';
		cstTree.addNode("CharList", "branch");
		parseSpace();
		cstTree.endChildren();
		if (!parseErrors.length > 0) {
			parseCharList();
			cstTree.endChildren();
		// error was found kick back	
		} else {
			// do nothing
		}
	// " empty list	
	} else if (currentTokenValue === '"') {
		document.getElementById("output").innerHTML += '<p>parseCharList()</p>';
		cstTree.addNode("CharList", "branch");
	// did not find a space or character or empty list	
	} else {
		parseErrors = ["space or character", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// parseType production
function parseType() {
	document.getElementById("output").innerHTML += '<p>parseType()</p>';
	cstTree.addNode("Type", "branch");
	// expecting a keyword
	if (typeKeywords.indexOf(currentTokenValue) > -1) {
		cstTree.addNode(currentTokenValue, "leaf");
		match();
	// keyword was not found	
	} else {
		parseErrors = ["type keyword", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// Char production
function parseChar() {
	document.getElementById("output").innerHTML += '<p>parseChar()</p>';
	cstTree.addNode("Char", "branch");
	// expecting a char
	if (chars.indexOf(currentTokenValue) > -1) {
		cstTree.addNode(currentTokenValue, "leaf");
		match();
	// char was not found	
	} else {
		parseErrors = ["Id", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// space production
function parseSpace() {
	document.getElementById("output").innerHTML += '<p>parseSpace()</p>';
	cstTree.addNode("Space", "branch");
	cstTree.addNode('" "', "leaf");
	match();
}

// Digit production
function parseDigit() {
	document.getElementById("output").innerHTML += '<p>parseDigit()</p>';
	cstTree.addNode("Digit", "branch");
	// expecting a digit
	if (digits.indexOf(currentTokenValue) > -1) {
		cstTree.addNode(currentTokenValue, "leaf");
		match();
	} else {
		parseErrors= ["digit", currentTokenValue, tokens[parseIndex][2]];
	}
}

// Boolop production 
function parseBoolop() {
	document.getElementById("output").innerHTML += '<p>parseBoolop()</p>';
	cstTree.addNode("Boolop", "branch");
	// expecting a boolop
	if (currentTokenValue === "==" || currentTokenValue === "!=") {
		cstTree.addNode(currentTokenValue, "leaf");
		match();
	// boolop was not found	
	} else {
		parseErrors = ["Boolop", currentTokenValue, tokens[parseIndex][2]];

	}
}

// Boolval production
function parseBoolVal() {
	document.getElementById("output").innerHTML += '<p>parseBoolVal()</p>';
	cstTree.addNode("Boolval", "branch");
	// expecting a boolval
	if (currentTokenValue === "false" || currentTokenValue === "true") {
		cstTree.addNode(currentTokenValue, "leaf");
		match();
	// boolval was not found	
	} else {
		parseErrors = ["boolval", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// IntOp production
function parseIntOp() {
	document.getElementById("output").innerHTML += '<p>parseIntOp()</p>';
	cstTree.addNode("intop", "branch");
	cstTree.addNode("+", "leaf");
	match();
}

// function was taken from http://labouseur.com/projects/jsTreeDemo/cstTreeDemo.js
// Using to build the concrete syntax tree and the abstract sytnax tree
function Tree() {
    // ----------
    // Attributes
    // ----------
    
    this.root = null;  // Note the NULL root node of this Tree.
    this.cur = {};     // Note the EMPTY current node of the Tree we're building.
    this.traversalDepth = 0;
    this.currentBranchNode = "";
    this.newCurrentBranchNode = "";

    // -- ------- --
    // -- Methods --
    // -- ------- --



    this.getIntop1 = function(nodeName) {
    	if (nodeName === "Print" || nodeName === "if") {
    		var lowerBranchNode = this.currentBranchNode.children[0];
    	} else if (nodeName === "Assign") {
    		var lowerBranchNode = this.currentBranchNode.children[1];
    	}	
    	return (lowerBranchNode.children[0].name);
    }

    this.getIntop2 = function(nodeName) {
    	if (nodeName === "Print" || nodeName === "if") {
    		var lowerBranchNode = this.currentBranchNode.children[0];
    	} else if (nodeName === "Assign") {	
    		var lowerBranchNode = this.currentBranchNode.children[1];
    	}	
    	return (lowerBranchNode.children[1].name);
    }

    this.numRootChildren = function() {
    	return this.root.children.length;
    }

    this.getBranchNodeOfRoot = function() {
    	//console.log(this.currentBranchNode.name);
    	if (this.currentBranchNode.name !== "if" || codeGenScope === 0) {
	    	if (branchNodeCounter < this.numRootChildren()) {
	    		if (codeGenScope === 0) {
					currentNodeCounter++;
					this.currentBranchNode = this.root.children[currentNodeCounter-1];
					branchNodeCounter++;
					if (this.currentBranchNode.name !== "Block") {
						return (this.currentBranchNode.name);
					} else {
						newBranchNodeCounter = currentNodeCounter;
						return (this.currentBranchNode.name);
					}	
				} else {
					newBlockCurrentNodeCounter = currentNodeCounter;
					currentNodeCounter = 0;
					getBranchNode();
				}		
			}
			return "done";
		} else {
			newBlockCurrentNodeCounter = currentNodeCounter;
			currentNodeCounter = 0;
			if (this.currentBranchNode.name === "if") {
    			this.currentBranchNode = this.currentBranchNode.children[1];
    		}
    		if (newBranchNodeCounter < this.currentBranchNode.children.length) {
    			currentNodeCounter++;
    			this.currentBranchNode = this.currentBranchNode.children[currentNodeCounter-1];
    			newBranchNodeCounter++;
    			console.log(this.currentBranchNode.name);
    			return(this.currentBranchNode.name);
    		} else {
    			codeGenScope--;
    			currentNodeCounter = newBlockCurrentNodeCounter;
    			return "branch done";
    		}
		}		
    }

    this.getLeafNode2 = function() {
    	return (this.currentBranchNode.children[1].name);
    }

    this.getLeafNode1 = function() {
    	return (this.currentBranchNode.children[0].name);
    }


    this.getBranchNode = function() {
    	if (this.currentBranchNode.name === "if") {
    		this.currentBranchNode = this.currentBranchNode.children[1];
    	}
    	if (newBranchNodeCounter < this.currentBranchNode.children.length) {
    		currentNodeCounter++;
    		this.currentBranchNode = this.currentBranchNode.children[currentNodeCounter-1];
    		newBranchNodeCounter++;
    		console.log(this.currentBranchNode.name);
    		return(this.currentBranchNode.name);
    	} else {
    		codeGenScope--;
    		currentNodeCounter = newBlockCurrentNodeCounter;
    		return "branch done";
    	}
    }








    // this.getBranchNode = function() {
    // 	if (newBranchNodeCounter < this.currentBranchNode.children.length) {
    // 		newBlockCurrentNodeCounter++;
    // 		this.newCurrentBranchNode = this.currentBranchNode.children[newBlockCurrentNodeCounter-1];
    // 		newBranchNodeCounter++;
    // 		return (this.currentBranchNode.name);
    // 	}
    // 	this.currentBranchNode = this.root.children[currentNodeCounter];
    // 	currentNodeCounter--;
    // 	return "branch complete";
    // }

    // this.ifNode = function() {

    // }



    // Add a node: kind in {branch, leaf}.
    this.addNode = function(name, kind) {
        // Construct the node object.
        var node = { name: name,
                     children: [],
                     parent: {}
                   };

        // Check to see if it needs to be the root node.
        if ( (this.root == null) || (!this.root) ) {
            // We are the root node.
            this.root = node;
        } else {
            // We are the children.
            // Make our parent the CURrent node...
            node.parent = this.cur;
            // ... and add ourselves (via the unfrotunately-named
            // "push" function) to the children array of the current node.
            this.cur.children.push(node);
        }
        // If we are an interior/branch node, then...
        if (kind == "branch") {
            // ... update the CURrent node pointer to ourselves.
            this.cur = node;
            this.traversalDepth++;
        }
    };

    // Note that we're done with this branch of the Tree...
    this.endChildren = function() {
    	this.traversalDepth--;
        // ... by moving "up" to our parent node (if possible).
        if ((this.cur.parent !== null) && (this.cur.parent.name !== undefined)) {
            this.cur = this.cur.parent;
        } else {
            // TODO: Some sort of error logging.
            // This really should not happen, but it will, of course.
        }
    };

    this.countDepth = function() {
    	var depthCounter = "";
    	var poop = 0;
    	function findDepth(node, depth) {
            // Space out based on the current depth so
            // this looks at least a little Tree-like.
            for (var i = 0; i < depth; i++) {
                depthCounter += "-";
                poop++
            }
            if (!node.children || node.children.length === 0) {
            	depthCounter = "";
            } else {
            	depthCounter = "";
                for (var i = 0; i < node.children.length; i++) {
                	poop = 0;
                    findDepth(node.children[i], depth + 1);
                }
            }
        }
        findDepth(this.root, 0);
        return (poop);

    }

    // Return a string representation of the cstTree.
    this.toString = function() {
        // Initialize the result string.
        var traversalResult = "";

        // Recursive function to handle the expansion of the nodes.
        function expand(node, depth) {
            // Space out based on the current depth so
            // this looks at least a little Tree-like.
            for (var i = 0; i < depth; i++) {
                traversalResult += "-";
            }
            // If there are no children (i.e., leaf nodes)...
            if (!node.children || node.children.length === 0) {
                // ... note the leaf node.
                traversalResult += "[" + node.name + "]";
                traversalResult += "\n";
            } else {
                // There are children, so note these interior/branch nodes and ...
                traversalResult += "<" + node.name + ">"; 
                traversalResult += "\n";
                // .. recursively expand them.
                for (var i = 0; i < node.children.length; i++) {
                    expand(node.children[i], depth + 1);
                }
            }
        }
        // Make the initial call to expand from the root.
        expand(this.root, 0);
        // Return the result.

        return traversalResult;
    };
}

// displays the outcome of the parse
function displayParseOutcome() {
	if (parseErrors.length > 0) {
		document.getElementById("output").innerHTML += '<p>Parse not completed for program '+programCounter+'</p>';
			if (parseErrors[0] === "$") {
				document.getElementById("output").innerHTML += '<p>Parse error: expecting end of file token but got '+parseErrors[1]+'</p>';
				document.getElementById("output").innerHTML += '<p>------------------------------------</p>';
			} else {
				document.getElementById("output").innerHTML += '<p>Parse error on line '+parseErrors[2]+'. Expecting '+parseErrors[0]+' but got '+parseErrors[1]+'</p>';
				document.getElementById("output").innerHTML += '<p>------------------------------------</p>';
			}
	} else {
		document.getElementById("output").innerHTML += '<p>Parse completed for program '+programCounter+'</p>';
		document.getElementById("output").innerHTML += '<p>------------------------------------</p>';
		document.getElementById("ctree").innerHTML += 'Program '+programCounter+' Concrete Syntax Tree\n';
		document.getElementById("ctree").innerHTML += cstTree;
		document.getElementById("ctree").innerHTML += '------------------------------------\n';
	}
}


