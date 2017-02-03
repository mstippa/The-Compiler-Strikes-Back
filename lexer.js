/*
* The purpose of the lexer is to take input characters and turn them into tokens which get sent to the parser
* 
*/


var tokens = {
	currentToken: ""
};



function sourceCode() {

	var input = document.getElementById('sourceCode').value; // get the source file
	input = input.replace(/^\s+|\s+$/g, ""); // this removes the leading and trailing spaces
	tokens.currentToken = input.charAt(0);

}

var grammar = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","}","(",")",1,2,3,4,5,6,7,8,9,"+","=",'"',"!","$"];

var transitionTable = [
	//[a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,{,},(,),1,2,3,4,5,6,7,8,9,+,=,",!,$]
	/*0*/[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],
	/*1*/["a",null,null,null,null,null,null,null,null,null,null,null,null,null,null,],
	/*2*/[],
	/*3*/[],
	/*4*/[],
	/*5*/[],
	/*6*/[],
	/*7*/[],
	/*8*/[],
	/*9*/[],
	/*10*/[],
	/*11*/[],
	/*12*/[],
	/*13*/[],
	/*14*/[],
	/*15*/[],
	/*16*/[],
	/*17*/[],
	/*18*/[],
	/*19*/[],
	/*20*/[],
	/*21*/[],
	/*22*/[],
	/*23*/[],
	/*24*/[],
	/*25*/[],
	/*26*/[],
	/*27*/[],
	/*28*/[],
	/*29*/[],
	/*30*/[],
	/*31*/[],
	/*32*/[],
	/*33*/[],
	/*34*/[],
	/*35*/[],
	/*36*/[],
	/*37*/[],
	/*38*/[],
	/*39*/[],
	/*40*/[],
	/*41*/[],
	/*42*/[],
	/*43*/[],
	/*44*/[],
	/*45*/[],
	/*46*/[],
	/*47*/[],
	/*48*/[],
	/*49*/[],
	/*50*/[],
	/*51*/[],
	/*52*/[],
	/*53*/[],
	/*54*/[],
	/*55*/[],
	/*1*/[],
	/*1*/[],
	/*1*/[],
	/*1*/[],
	/*1*/[]
];
