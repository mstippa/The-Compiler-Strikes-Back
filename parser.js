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
		parseIndex = startOfProgram
		currentTokenValue = tokens[parseIndex][1];
	}
	console.log(currentTokenValue);	
	errorCounter = 0;
	tree = new Tree(); // creates a new tree object
	parseProgram();
	tree.endChildren();
	displayParseOutcome();
	if (currentTokenValue === "$" && tokens[parseIndex+1] !== undefined) {
		parseIndex++;
		parseErrors = [];
	} else {
		var i = parseIndex;
		while (i < tokens.length) {
			if (tokens[i][1] === "$") {
				parseIndex = i+1;
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
	tree.addNode("Program", "branch"); // create a Program branch node
	parseBlock();
	tree.endChildren(); // end the children aka we're done with this branch of the tree
	// if error was found then don't continue with the parse
	if (!parseErrors.length > 0) {
		// if end of file token was not found at this point in the parse then that's an error!
		if (currentTokenValue !== "$") {
			parseErrors = ["$", currentTokenValue];
		} else {
			tree.addNode("$", "leaf"); // create a end of file leaf node
		}
	} else {
		// do nothing
	}	
}

// block production
function parseBlock() {
	document.getElementById("output").innerHTML += '<p>parseBlock()</p>';
	tree.addNode("Block", "branch"); //create a Block branch node
	if (currentTokenValue === "{") {
		tree.addNode("{","leaf"); // create a { leaf node
		match();
		// checking for null pointer exception
		if (tokens.length > parseIndex) {
			// checking if statementList is equal to the empty set
			if (currentTokenValue === "}") {
				document.getElementById("output").innerHTML += '<p>parseStatementList()</p>';
				tree.addNode("StatementList", "branch"); // create a Statementlist branch node
				tree.endChildren();
				tree.addNode("}", "leaf");
				tree.endChildren();
				match();
			// if statementList is not the empty set	
			} else {
				parseStatementList();
				if (!parseErrors.length > 0) {
					// if here then } should be the current token 
					if (currentTokenValue === "}") {
						tree.addNode("}","leaf");
						tree.endChildren();
						match();
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
		tree.addNode("StatementList", "branch");
		parseStatement();
		tree.endChildren();
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
	tree.addNode("Statement", "branch");
	// printStatement production has been found
	if (currentTokenValue === "print") {
		parsePrintStatement();
		tree.endChildren();
	// assignmentStatement production has been found	
	} else if (chars.indexOf(currentTokenValue) > -1) {
		parseAssignmentStatement();
		tree.endChildren();
	// varDecl production has been found	
	} else if (typeKeywords.indexOf(currentTokenValue) > -1) {
		parseVarDecl();
		tree.endChildren();
	// whileStatement production has been found	
	} else if (currentTokenValue === "while") {
		parseWhileStatement();
		tree.endChildren();
	// ifStatement production has been found	
	} else if (currentTokenValue === "if") {
		parseIfStatement();
		tree.endChildren();
	// 	Block production has been found
	} else if (currentTokenValue === "{") {
		parseBlock();
		tree.endChildren();
	// if here then a statement has not been found	
	} else {
		parseErrors = ["Statement", currentTokenValue, tokens[parseIndex][2]];
		match();	
	}	
}

// PrintStatement production
function parsePrintStatement() {
	document.getElementById("output").innerHTML += '<p>parsePrintStatement()</p>';
	tree.addNode("PrintStatement", "branch");
	tree.addNode("print", "leaf");
	match();
	// if here than "(" is expected
	if (currentTokenValue === "(") {
		tree.addNode("(", "leaf");
		match();
		parseExpr();
		tree.endChildren();
		// needs to be clothing paren after Expr has been called
		if (currentTokenValue === ")") {
			tree.addNode(")", "leaf");
			tree.endChildren();
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
	tree.addNode("AssignmentStatement", "branch");
	parseId();
	tree.endChildren();
	// "=" is expected after an id
	if (currentTokenValue === "=") {
		tree.addNode("=", "leaf");
		match();
		parseExpr();
		tree.endChildren();
	// no "=" was found	
	} else {
		parseErrors = ["=", currentTokenValue, tokens[parseIndex][2]];
		match();
	}	
}

// varDecl production
function parseVarDecl() {
	document.getElementById("output").innerHTML += '<p>parseVarDecl()</p>';
	tree.addNode("VarDecl", "branch");
	parseType(); // will check in type production if keyword is current token
	tree.endChildren();
	parseId(); // will check in id production if char is current token
	tree.endChildren();
}

// WhileStatement production
function parseWhileStatement() {
	document.getElementById("output").innerHTML += '<p>parseWhileStatement()</p>';
	tree.addNode("WhileStatement", "branch");
	tree.addNode("while", "leaf");
	match();
	parseBooleanExpr(); // booleanexpr is expected after while keyword
	tree.endChildren();
	// making sure there are no errors
	if (!parseErrors.length > 0) {
		parseBlock();
		tree.endChildren();
	// send it back!!!	
	} else {
		// do nothing
	}		
}

// IfStatement production
function parseIfStatement() {
	document.getElementById("output").innerHTML += '<p>parseIfStatement()</p>';
	tree.addNode("IfStatement", "branch");
	tree.addNode("if", "leaf");
	match();
	parseBooleanExpr(); // booleanexpr is expected after if keyword
	tree.endChildren();
	// checking for no errors
	if (!parseErrors.length > 0) {
		parseBlock();
		tree.endChildren();
	// if there are errors, send it back!!	
	} else { 
		// do nothing
	}	
}

// Expr production
function parseExpr() {
	document.getElementById("output").innerHTML += '<p>parseExpr()</p>';
	tree.addNode("Expr", "branch");
	// intexpr production has been found
	if (digits.indexOf(currentTokenValue) > -1) {
		parseIntExpr();
		tree.endChildren();
	// stringexpr production has been found
	} else if (currentTokenValue === '"') {
		parseStringExpr();
		tree.endChildren();
	// booleanexpr production has been found	
	} else if (currentTokenValue === "(" || currentTokenValue === "true" || currentTokenValue === "false") {
		parseBooleanExpr();
		tree.endChildren();
	// id production has been found	
	} else if (chars.indexOf(currentTokenValue) > -1) {
		parseId();
		tree.endChildren();
	// error!! Expecting expr but got something else	
	} else {
		parseErrors = ["Expr", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// IntExpr production
function parseIntExpr() {
	document.getElementById("output").innerHTML += '<p>parseIntExpr()</p>';
	tree.addNode("IntExpr", "branch");
	parseDigit(); // expecting a digit at this point
	tree.endChildren();
	// just making sure there are no errors
	if (!parseErrors.length > 0) {
		// expecting a intop
		if (currentTokenValue === "+") {
			parseIntOp();
			tree.endChildren();
			if (!parseErrors.length > 0) {
				parseExpr();
				tree.endChildren();
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
	tree.addNode("StringExpr", "branch");
	tree.addNode('"', "leaf");
	match();
	parseCharList(); // looking for charlist
	tree.endChildren();
	// if there are no errors
	if (!parseErrors.length > 0) {
		// expecting a "
		if (currentTokenValue === '"') {
			tree.addNode('"', "leaf");
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
	tree.addNode("BooleanExpr", "branch");
	// found a boolval production
	if (currentTokenValue === "true" || currentTokenValue === "false") {
		parseBoolVal();
		tree.endChildren();
	// found a paren	
	} else if (currentTokenValue === "(") {
		tree.addNode("(", "leaf");
		match();
		parseExpr();
		tree.endChildren();
		if (!parseErrors.length > 0) {
			console.log(currentTokenValue);
			parseBoolop();
			tree.endChildren();
			if (!parseErrors.length > 0) {
				parseExpr();
				tree.endChildren();
				if (!parseErrors.length > 0) {
					if (currentTokenValue === ")") {
						tree.addNode(")", "leaf");
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
	tree.addNode("Id", "branch");
	parseChar();
	tree.endChildren();
	tree.endChildren();
}

// Charlist production
function parseCharList() {
	// found a char production
	if (chars.indexOf(currentTokenValue) > -1) {
		document.getElementById("output").innerHTML += '<p>parseCharList()</p>';
		tree.addNode("CharList", "branch");
		parseChar();
		tree.endChildren();
		if (!parseErrors.length > 0) {
			parseCharList();
			tree.endChildren();
		} else {
			// do nothing
		}	
	// found a space production	
	} else if (currentTokenValue === " ") {	
		document.getElementById("output").innerHTML += '<p>parseCharList()</p>';
		tree.addNode("CharList", "branch");
		parseSpace();
		tree.endChildren();
		if (!parseErrors.length > 0) {
			parseCharList();
			tree.endChildren();
		// error was found kick back	
		} else {
			// do nothing
		}
	// " empty list	
	} else if (currentTokenValue === '"') {
		document.getElementById("output").innerHTML += '<p>parseCharList()</p>';
		tree.addNode("CharList", "branch");
	// did not find a space or character or empty list	
	} else {
		parseErrors = ["space or character", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// parseType production
function parseType() {
	document.getElementById("output").innerHTML += '<p>parseType()</p>';
	tree.addNode("Type", "branch");
	// expecting a keyword
	if (typeKeywords.indexOf(currentTokenValue) > -1) {
		tree.addNode(currentTokenValue, "leaf");
		match();
	// keyword was not found	
	} else {
		parseErrors = ["type keyword", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// Char production
function parseChar() {
	document.getElementById("output").innerHTML += '<p>parseChar()</p>';
	tree.addNode("Char", "branch");
	// expecting a char
	if (chars.indexOf(currentTokenValue) > -1) {
		tree.addNode(currentTokenValue, "leaf");
		match();
	// char was not found	
	} else {
		parseErrors = ["Id", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// space production
function parseSpace() {
	document.getElementById("output").innerHTML += '<p>parseSpace()</p>';
	tree.addNode("Space", "branch");
	tree.addNode('" "', "leaf");
	match();
}

// Digit production
function parseDigit() {
	document.getElementById("output").innerHTML += '<p>parseDigit()</p>';
	tree.addNode("Digit", "branch");
	// expecting a digit
	if (digits.indexOf(currentTokenValue) > -1) {
		tree.addNode(currentTokenValue, "leaf");
		match();
	} else {
		parseErrors= ["digit", currentTokenValue, tokens[parseIndex][2]];
	}
}

// Boolop production 
function parseBoolop() {
	document.getElementById("output").innerHTML += '<p>parseBoolop()</p>';
	tree.addNode("Boolop", "branch");
	// expecting a boolop
	if (currentTokenValue === "==" || currentTokenValue === "!=") {
		tree.addNode(currentTokenValue, "leaf");
		match();
	// boolop was not found	
	} else {
		parseErrors = ["Boolop", currentTokenValue, tokens[parseIndex][2]];

	}
}

// Boolval production
function parseBoolVal() {
	document.getElementById("output").innerHTML += '<p>parseBoolVal()</p>';
	tree.addNode("Boolval", "branch");
	// expecting a boolval
	if (currentTokenValue === "false" || currentTokenValue === "true") {
		tree.addNode(currentTokenValue, "leaf");
		match();
	// boolval was not found	
	} else {
		parseErrors = ["boolval", currentTokenValue, tokens[parseIndex][2]];
	}	
}

// IntOp production
function parseIntOp() {
	document.getElementById("output").innerHTML += '<p>parseIntOp()</p>';
	tree.addNode("intop", "branch");
	tree.addNode("+", "leaf");
	match();
}

// function was taken from http://labouseur.com/projects/jsTreeDemo/treeDemo.js
// builds the tree
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
				document.getElementById("output").innerHTML += '<p>-----------------------------------------------------------------</p>';
			} else {
				document.getElementById("output").innerHTML += '<p>Parse error on line '+parseErrors[2]+'. Expecting '+parseErrors[0]+' but got '+parseErrors[1]+'</p>';
				document.getElementById("output").innerHTML += '<p>-----------------------------------------------------------------</p>';
			}
	} else {
		document.getElementById("output").innerHTML += '<p>Parse completed for program '+programCounter+'</p>';
		document.getElementById("output").innerHTML += '<p>-----------------------------------------------------------------</p>';
		document.getElementById("tree").innerHTML += 'Program '+programCounter+' tree\n';
		document.getElementById("tree").innerHTML += tree;
		document.getElementById("tree").innerHTML += '------------------------------------\n';
	}
}


