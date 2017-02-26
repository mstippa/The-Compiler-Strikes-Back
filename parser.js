/*
* The parser takes the tokens from the lexer and sees if together, they create valid sentences 
*/


function parse () {
	parseProgram();
}


function parseProgram() {
	parseBlock();
}


function parseBlock() {
	parseStatementList();
}


function parseStatementList() {
	parseStatement();
}


function parseStatement() {
	parsePrintStatement();
	parseAssignmentStatement();
	parseVarDecl();
	parseWhileStatement();
	parseIfStatement();
	parseBlock();
}


function parsePrintStatement() {
	parseExpr();
}


function parseAssignmentStatement() {
	parseExpr();
}


function parseVarDecl() {
	parseType();
	parseId();
}


function parseWhileStatement() {
	parseBooleanExpr();
	parseBlock();
}


function parseIfStatement() {
	parseBlock();
	parseBlock();
}


function parseExpr() {
	parseIntExpr();
	parseStringExpr();
	parseBooleanExpr();
	parseId(;
}


function parseIntExpr() {
	parseDigit();
	parseIntOp();
	parseExpr();
}


function parseStringExpr() {
	parseCharList();
}


function parseBooleanExpr() {
	parseExpr();
	parseBoolop();
	parseExpr();
	parseBoolVal();
}


function parseId() {
	parseChar();
}


function parseCharList() {
	parseChar();
	parseCharList();
	parseSpace();
}


function parseType() {

}


function parseChar() {

}











