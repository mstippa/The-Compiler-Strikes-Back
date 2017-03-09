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
var tree = new Tree();


function match() {
	parseIndex++;
	if (parseIndex < tokens.length) {
		currentTokenValue = tokens[parseIndex][1];
	}	
}

function parse () {
	currentTokenValue = tokens[parseIndex][1];
	parseProgram();
	displayParseOutcome();
}


function parseProgram() {
	tree.addNode("Program", "branch");
	parseBlock();
	tree.endChildren();
	if (!parseErrors.length > 0) {
		if (currentTokenValue !== "$") {
			parseErrors = ["$", currentTokenValue];
		} else {
			tree.addNode("$", "leaf");
			tree.endChildren();
		}
	} else {
		// do nothing
	}	
}


function parseBlock() {
	tree.addNode("Block", "branch");
	if (currentTokenValue === "{") {
		tree.addNode("{","leaf");
		match();
		if (tokens.length > parseIndex) {
			if (tokens[parseIndex][1] === "}") {
				tree.addNode("StatementList", "branch");
				tree.addNode("","leaf");
				tree.endChildren();
				tree.addNode("}", "leaf");
				tree.endChildren();
				match();
			} else {
				parseStatementList();
				tree.endChildren();
				if (!parseErrors.length > 0) {
					if (currentTokenValue === "}") {
						tree.addNode("}","leaf");
						tree.endChildren();
						match();
					} else {
						parseErrors = ["}", currentTokenValue, tokens[parseIndex][2]];
					}
				} else {
					// do nothing
				}	
			}
		} else {
			parseErrors = ["StatementList", currentTokenValue, tokens[parseIndex-1][2]];
		}	
	} else {
		parseErrors = ["{", currentTokenValue, tokens[parseIndex][2]];
	}
}

function parseStatementList() {
	tree.addNode("StatementList", "branch");
	if (currentTokenValue === "}" || currentTokenValue === null) {
	// do nothing		
	} else {
		parseStatement();
		tree.endChildren();
		if (!parseErrors.length > 0) {
			parseStatementList();
			tree.endChildren();
		} else {
			// do nothing
		}	
	}
}


function parseStatement() {
	tree.addNode("Statement", "branch");
	if (currentTokenValue === "print") {
		parsePrintStatement();
		tree.endChildren();
	} else if (chars.indexOf(currentTokenValue) > -1) {
		parseAssignmentStatement();
		tree.endChildren();
	} else if (typeKeywords.indexOf(currentTokenValue) > -1) {
		parseVarDecl();
		tree.endChildren();
	} else if (currentTokenValue === "while") {
		parseWhileStatement();
		tree.endChildren();
	} else if (currentTokenValue === "if") {
		tree.addNode("IfStatement", "branch");
		match();
		parseIfStatement();
		tree.endChildren();
	} else if (currentTokenValue === "{") {
		parseBlock();
		tree.endChildren();
	} else {
		if (currentTokenValue === "$") {
			// do nothing
		} else {
			parseErrors = ["Statement", currentTokenValue, tokens[parseIndex][2]];
		}	
	}	
}


function parsePrintStatement() {
	tree.addNode("PrintStatement", "branch");
	tree.addNode("print", "leaf");
	tree.endChildren();
	match();
	if (currentTokenValue === "(") {
		tree.addNode("(", "leaf");
		tree.endChildren();
		match();
		parseExpr();
		tree.endChildren();
		if (currentTokenValue === ")") {
			tree.addNode(")", "leaf");
			tree.endChildren();
			match();
		} else {
			parseErrors = [")", currentTokenValue, tokens[parseIndex][2]];
		}
	} else {
		parseErrors = ["(", currentTokenValue, tokens[parseIndex][2]];
	}
}


function parseAssignmentStatement() {
	tree.addNode("AssignmentStatement", "branch");
	parseId();
	tree.endChildren();
	if (currentTokenValue === "=") {
		tree.addNode("=", "leaf");
		tree.endChildren();
		match();
		parseExpr();
		tree.endChildren();
	} else {
		parseErrors = ["=", currentTokenValue, tokens[parseIndex][2]];
	}	
}


function parseVarDecl() {
	tree.addNode("VarDecl", "branch");
	parseType();
	tree.endChildren();
	parseId();
	tree.endChildren();
}


function parseWhileStatement() {
	tree.addNode("WhileStatement", "branch");
	tree.addNode("While", "leaf");
	tree.endChildren();
	match();
	parseBooleanExpr();
	tree.endChildren();
	if (!parseErrors.length > 0) {
		parseBlock();
		tree.endChildren();
	} else {
		// do nothing
	}		
}


function parseIfStatement() {
	tree.addNode("IfExpr", "branch");
	tree.addNode("If", "leaf");
	tree.endChildren();
	match();
	parseBooleanExpr();
	tree.endChildren();
	if (!parseErrors.length > 0) {
		parseBlock();
		tree.endChildren();
	} else { 
		// do nothing
	}	
}


function parseExpr() {
	tree.addNode("ParseExpr", "branch");
	if (digits.indexOf(currentTokenValue) > -1) {
		parseIntExpr();
		tree.endChildren();
	} else if (currentTokenValue === '"') {
		parseStringExpr();
		tree.endChildren();
	} else if (currentTokenValue === "(" || currentTokenValue === "true" || currentTokenValue === "false") {
		parseBooleanExpr();
		tree.endChildren();
	} else if (chars.indexOf(currentTokenValue) > -1) {
		parseId();
		tree.endChildren();
	} else {
		parseErrors = ["ParseExpr", currentTokenValue, tokens[parseIndex][2]];
	}	
}


function parseIntExpr() {
	tree.addNode("IntExpr", "branch");
	tree.addNode(currentTokenValue, "leaf");
	tree.endChildren();
	match();
	parseDigit();
	tree.endChildren();
	if (!parseErrors.length > 0) {
		if (currentTokenValue === "+") {
			parseIntOp();
			tree.endChildren();
			if (!parseErrors.length > 0) {
				parseExpr();
				tree.endChildren();
			} else {
				// do nothing
			}	
		}	
	} else {
		// do nothing
	}		
}


function parseStringExpr() {
	tree.addNode("StringExpr", "branch");
	tree.addNode('"', "leaf");
	tree.endChildren();
	match();
	parseCharList();
	tree.endChildren();
	if (!parseErrors.length > 0) {
		if (currentTokenValue === '"') {
			tree.addNode('"', "leaf");
			tree.endChildren();
			match();
		} else {
			parseErrors = ['"', currentTokenValue, tokens[parseIndex][2]];
		}
	} else {
		// do nothing
	}	
}


function parseBooleanExpr() {
	tree.addNode("BooleanExpr", "branch");
	if (currentTokenValue === "true" || currentTokenValue === "false") {
		parseBoolVal();
		tree.endChildren();
	} else if (currentTokenValue === "(") {
		tree.addNode("(", "leaf");
		tree.endChildren();
		match();
		parseExpr();
		tree.endChildren();
		if (!parseErrors.length > 0) {
			parseBoolop();
			tree.endChildren();
			if (!parseErrors.length > 0) {
				parseExpr();
				tree.endChildren();
				if (!parseErrors.length > 0) {
					if (currentTokenValue === ")") {
						tree.addNode(")", "leaf");
						tree.endChildren();
						match();
					} else {
						parseErrors = [")", currentTokenValue, tokens[parseIndex][2]];
					}
				} else {
					// do nothing
				}	
			} else {
				// do nothing
			}	
		} else {
			// do nothing
		}	
	}
}


function parseId() {
	tree.addNode("Id", "branch");
	parseChar();
	tree.endChildren();
}


function parseCharList() {
	tree.addNode("CharList", "branch");
	if (chars.indexOf(currentTokenValue) > -1) {
		parseChar();
		tree.endChildren();
		if (!parseErrors.length > 0) {
			parseCharList();
			tree.endChildren();
		} else {
			// do nothing
		}	
	} else if (currentTokenValue === " ") {	
		parseSpace();
		tree.endChildren();
		if (!parseErrors.length > 0) {
			parseCharList();
			tree.endChildren();
		} else {
			// do nothing
		}	
	} else if (currentTokenValue === '"') {
		// do nothing
	} else {
		parseErrors = ["space or character", currentTokenValue, tokens[parseIndex][2]];
	}	
}


function parseType() {
	tree.addNode("Type", "branch");
	if (typeKeywords.indexOf(currentTokenValue) > -1) {
		tree.addNode(currentTokenValue, "leaf");
		tree.endChildren();
		match();
	} else {
		parseErrors = ["type keyword", currentTokenValue, tokens[parseIndex][2]];
	}	
}


function parseChar() {
	tree.addNode("Char", "branch");
	if (chars.indexOf(currentTokenValue) > -1) {
		tree.addNode(currentTokenValue, "leaf");
		tree.endChildren();
		match();
	} else {
		parseErrors = ["Id", currentTokenValue, tokens[parseIndex][2]];
	}	
}


function parseSpace() {
	tree.addNode("Space", "branch");
	tree.addNode('" "', "leaf");
	tree.endChildren();
	match();
}


function parseDigit() {
	tree.addNode("Digit", "branch");
	if (digits.indexOf(currentTokenValue) > -1) {
		tree.addNode(currentTokenValue, "leaf");
		tree.endChildren();
		match();
	} else {
		parseErrors= ["digit", currentTokenValue, tokens[parseIndex][2]];
	}
}


function parseBoolop() {
	tree.addNode("Boolop", "branch");
	if (currentTokenValue === "==" || currentTokenValue === "!=") {
		tree.addNode(currentTokenValue, "leaf");
		tree.endChildren();
		match();
	} else {
		parseErrors = ["Boolop", currentTokenValue, tokens[parseIndex][2]];

	}
}


function parseBoolVal() {
	tree.addNode("Boolval", "branch");
	if (currentTokenValue === "false" || currentTokenValue === "true") {
		tree.addNode(currentTokenValue, "leaf");
		tree.endChildren();
		match();
	} else {
		parseErrors = ["boolval", currentTokenValue, tokens[parseIndex][2]];
	}	
}


function parseIntOp() {
	tree.addNode("intop", "branch");
	tree.addNode("+", "leaf");
	tree.endChildren();
	match();
}


function Tree() {
    // ----------
    // Attributes
    // ----------
    
    this.root = null;  // Note the NULL root node of this tree.
    this.cur = {};     // Note the EMPTY current node of the tree we're building.


    // -- ------- --
    // -- Methods --
    // -- ------- --

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
        }
    };

    // Note that we're done with this branch of the tree...
    this.endChildren = function() {
        // ... by moving "up" to our parent node (if possible).
        if ((this.cur.parent !== null) && (this.cur.parent.name !== undefined)) {
            this.cur = this.cur.parent;
        } else {
            // TODO: Some sort of error logging.
            // This really should not happen, but it will, of course.
        }
    };

    // Return a string representation of the tree.
    this.toString = function() {
        // Initialize the result string.
        var traversalResult = "";

        // Recursive function to handle the expansion of the nodes.
        function expand(node, depth) {
            // Space out based on the current depth so
            // this looks at least a little tree-like.
            for (var i = 0; i < depth; i++) {
                traversalResult += "-";
            }
            // If there are no children (i.e., leaf nodes)...
            if (!node.children || node.children.length === 0) {
                // ... note the leaf node.
                traversalResult += "[" + node.name + "]";
                //console.log(traversalResult);
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

        console.log(traversalResult);
        return traversalResult;
    };
}


function displayParseOutcome() {
	if (parseErrors.length > 0) {
		document.getElementById("output").innerHTML += '<p>Parse not completed for program '+tokens[parseIndex-1][3]+'</p>';
			if (parseErrors[0] === "$") {
				document.getElementById("output").innerHTML += '<p>Parse error: no end of file token found</p>';
			} else {
				document.getElementById("output").innerHTML += '<p>Parse error on line '+parseErrors[2]+'. Expecting '+parseErrors[0]+' but got '+parseErrors[1]+'</p>';
			}
	} else {
		document.getElementById("output").innerHTML += '<p>Parse completed for program '+tokens[parseIndex][3]+'</p>';
		document.getElementById("tree").innerHTML += tree;
	}
}


