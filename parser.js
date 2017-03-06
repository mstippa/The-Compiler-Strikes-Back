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
	console.log(parseIndex);
	currentTokenValue = tokens[parseIndex][1];
}

function parse () {
	currentTokenValue = tokens[parseIndex][1];
	nextTokenValue = tokens[parseIndex+1][1];
	parseProgram();
	document.getElementById("tree").innerHTML += tree;
}


function parseProgram() {
	tree.addNode("Program", "branch");
	parseBlock(); 
	if (currentTokenValue !== "$") {
		parseErrors[errorCounter] = tokens[parseIndex];
		errorCounter++;
		document.getElementById("output").innerHTML += '<p>Parse error on line  '+tokens[parseIndex][2]+'. Expecting "$" but got '+tokens[parseIndex+1][1]+'</p>';
	} else {
		tree.addNode("$", "leaf");
		tree.endChildren();
		document.getElementById("output").innerHTML += '<p>Parse completed for program   '+tokens[parseIndex][3]+'</p>';
	}
}


function parseBlock() {
	tree.addNode("Block", "branch");
	if (currentTokenValue === "{" && tokens[parseIndex+1][1] === "}") {
		tree.addNode("StatementList", "branch");
		tree.addNode("{","leaf");
		tree.endChildren();
		console.log(currentTokenValue)
		match();
		tree.addNode("","leaf");
		tree.endChildren();
		tree.addNode("}", "leaf");
		tree.endChildren();
		match();
	} else if (currentTokenValue === "{") {	
		tree.addNode("{", "leaf");
		tree.endChildren();
		match();
		parseStatementList();
		if (currentTokenValue === "}") {
			tree.addNode("}","leaf");
			tree.endChildren();
			match();
		} else {
			parseErrors[errorCounter] = ["}", currentTokenValue];
			errorCounter++;
			match();
		}
	} else {
		parseErrors[errorCounter] = ["{", currentTokenValue];
		errorCounter++;
		match();
	}	
}


function parseStatementList() {
	tree.addNode("StatementList", "branch");
	if (currentTokenValue === "}" || currentTokenValue === null) {
	// do nothing		
	} else {
		parseStatement();
		parseStatementList();
	}
}


function parseStatement() {
	tree.addNode("Statement", "branch");
	if (currentTokenValue === "print") {
		parsePrintStatement();
	} else if (chars.indexOf(currentTokenValue) > -1) {
		parseAssignmentStatement();
	} else if (typeKeywords.indexOf(currentTokenValue) > -1) {
		parseVarDecl();
	} else if (currentTokenValue === "while") {
		parseWhileStatement();
	} else if (currentTokenValue === "if") {
		tree.addNode("IfStatement", "branch");
		match();
		parseIfStatement();
	} else if (currentTokenValue === "{") {
		parseBlock();
	} else {
		parseErrors[errorCounter] = ["Statement", currentTokenValue];
		errorCounter++;
		match();
	}	
}


function parsePrintStatement() {
	tree.addNode("PrintStatement", "branch");
	if (currentTokenValue === "(") {
		tree.addNode("(", "leaf");
		tree.endChildren();
		match();
		parseExpr();
	} else {
		parseErrors[errorCounter] = ["(", currentTokenValue];
		errorCounter++;
		match();
	}
}


function parseAssignmentStatement() {
	tree.addNode("AssignmentStatement", "branch");
	parseId();
	if (currentTokenValue === "=") {
		tree.addNode("=", "leaf");
		tree.endChildren();
		match();
		parseExpr();
	} else {
		parseErrors[errorCounter] = ["=", currentTokenValue];
		errorCounter++;
		match();
	}	
}


function parseVarDecl() {
	tree.addNode("VarDecl", "branch");
	parseType();
	parseId();
}


function parseWhileStatement() {
	tree.addNode("WhileStatement", "branch");
	tree.addNode("While", "leaf");
	tree.endChildren();
	match();
	parseBooleanExpr();
	parseBlock();	
}


function parseIfStatement() {
	tree.addNode("IfExpr", "branch");
	tree.addNode("If", "leaf");
	tree.endChildren();
	match();
	parseBooleanExpr();
	parseBlock();
}


function parseExpr() {
	tree.addNode("ParseExpr", "branch");
	if (digits.indexOf(currentTokenValue) > -1) {
		parseIntExpr();
	} else if (currentTokenValue === '"') {
		parseStringExpr();
	} else if (currentTokenValue === "(" || currentTokenValue === "true" || currentTokenValue === "false") {
		parseBooleanExpr();
	} else if (chars.indexOf(currentTokenValue) > -1) {
		parseId();
	} else {
		parseErrors[errorCounter] = ["ParseExpr", currentTokenValue];
		errorCounter++;
		match();
	}	
}


function parseIntExpr() {
	tree.addNode("IntExpr", "branch");
	tree.addNode(currentTokenValue, "leaf");
	tree.endChildren();
	match();
	parseDigit();
	if (currentTokenValue === "+") {
		parseIntOp();
		parseExpr();
	}
}


function parseStringExpr() {
	tree.addNode("StringExpr", "branch");
	tree.addNode('"', "leaf");
	tree.endChildren();
	match();
	parseCharList();
	if (currentTokenValue === '"') {
		tree.addNode('"', "leaf");
		tree.endChildren();
		match();
	} else {
		parseErrors[errorCounter] = ['"', currentTokenValue];
		errorCounter++;
		match();
	}
}


function parseBooleanExpr() {
	tree.addNode("BooleanExpr", "branch");
	if (currentTokenValue === "true" || currentTokenValue === "false") {
		parseBoolVal();
	} else if (currentTokenValue === "(") {
		tree.addNode("(", "leaf");
		tree.endChildren();
		match();
		parseExpr();
		parseBoolop();
		parseExpr();
		if (currentTokenValue === ")") {
			tree.addNode(")", "leaf");
			tree.endChildren();
			match();
		} else {
			parseErrors[errorCounter] = [")", currentTokenValue];
			errorCounter++;
			match();
		}
	}
}


function parseId() {
	tree.addNode("Id", "branch");
	parseChar();
}


function parseCharList() {
	tree.addNode("CharList", "branch");
	if (chars.indexOf(currentTokenValue) > -1) {
		parseChar();
		parseCharList();
	} else if (currentTokenValue === " ") {	
		parseSpace();
		parseCharList();
	} else if (currentTokenValue === '"') {
		// do nothing
	} else {
		parseErrors[errorCounter] = ["space or character", currentTokenValue];
		errorCounter++;
		match();
	}	
}


function parseType() {
	tree.addNode("Type", "branch");
	if (typeKeywords.indexOf(currentTokenValue) > -1) {
		tree.addNode(currentTokenValue, "leaf");
		tree.endChildren();
		match();
		parseId();
	} else {
		parseErrors[errorCounter] = ["type keyword", currentTokenValue];
		errorCounter++;
		match();
	}	
}


function parseChar() {
	tree.addNode("Char", "branch");
	if (chars.indexOf(currentTokenValue) > -1) {
		tree.addNode(currentTokenValue, "leaf");
		tree.endChildren();
		match();
	} else {
		parseErrors[errorCounter] = ["Id", currentTokenValue];
		errorCounter++;
		match();
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
		parseErrors[errorCounter] = ["digit", currentTokenValue];
		errorCounter++;
		match();
	}
}


function parseBoolop() {
	tree.addNode("Boolop", "branch");
	if (currentTokenValue === "==" || currentTokenValue === "!=") {
		tree.addNode(currentTokenValue, "leaf");
		tree.endChildren();
		match();
	} else {
		parseErrors[errorCounter] = ["Boolop", currentTokenValue];
		errorCounter++;
		match();
	}
}


function parseBoolVal() {
	tree.addNode("Boolval", "branch");
	if (currentTokenValue === "false" || currentTokenValue === "true") {
		tree.addNode(currentTokenValue, "leaf");
		tree.endChildren();
		match();
	} else {
		parseErrors[errorCounter] = ["boolval", currentTokenValue];
		errorCounter++;
		match();
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
            console.log(node.name);
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
                console.log(traversalResult);
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


function displayParseOutcome() {
	document.getElementById("output").innerHTML += '<p>Parse error on line  '+tokens[parseIndex][2]+'. Expecting "$" but got '+tokens[parseIndex+1][1]+'</p>';
	document.getElementById("output").innerHTML += '<p>Parse completed for program   '+tokens[parseIndex][3]+'</p>';
}


