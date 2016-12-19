console.log("unit testing ... ");


/**
 *  Tests if two floats are equal (close enough).  If no epsilon is
 *  given, sets epsilon to 0.01.
 *
 *  Tests if |f1-f2| <= ɛ 
 *
 */
function floatEqual(f1, f2, epsilon) {
    if (typeof epsilon === "undefined") {
	    epsilon = 0.001;
    }
    return Math.abs(f1-f2) <= epsilon;
}


function errorString(name, data, expected, actual) {
    var r = "error: " + name + " on " + data + ".  ";
    r += "Was " + actual + ", expected " + expected;
    return r;
}

function unitTestCarleStrub(arr, hatN) {
    // testing C&S
    var cs = ElfishMathEstimate(arr, "cs");

    if (cs != hatN) {
        var s = errorString("Carle & Strub", arr, hatN, cs);
        console.log(s);
        console.error(s);
    }
}


function unitTestZippin(arr, hatN) {
    // testing Z
    var z = ElfishMathEstimate(arr, "zippin");

    if (z != hatN) {
        var s = errorString("Zippin", arr, hatN, z);
        console.log(s);
        console.error(s);
    }
}


function unitTestCatch(arr, hatN, p) {
    // testing X
    console.log("unit: Testing catch");
    var out = ElfishMathCatch(arr,hatN);
    if (Math.round(100*out) != Math.round(p*100)) {
        var s = errorString("Catch", arr, p, out);
        console.log(s);
        console.error(s);
    }
}


function unitTestX(arr, x) {
    // testing X
    var out = ElfishMathX(arr);
    if (out != x) {
        var s = errorString("X", arr, x, out);
        console.log(s);
        console.error(s);
    }
}


function unitTestConfidenceInterval(arr, ci, meth) {
    var res = ElfishMathConfidenceInterval(arr, meth);
    
    if (Math.round(res*10) != Math.round(ci* 10)) {
        var s = errorString("ci", arr, ci, res);
        console.log(s);
        console.error(s);
    }
}




//
// 1
//
var arr = [19,17,13,1,1];
var hatNZ = 53;
var hatNCS = 53;
var p = 0.46;
var x = 154;
var ciZ = 4.4;

unitTestX(arr, x);
unitTestZippin(arr, hatNZ);
unitTestCatch(arr, hatNZ, p, x);
unitTestConfidenceInterval(arr, ciZ, "zippin");
unitTestCarleStrub(arr,hatNCS);




//
// 2
//
arr = [10,20,30,24,2,7];
hatNZ = 156;
hatNCS = 145;
p = 0.14;
x = 270;
ciZ = 80.29;

unitTestX(arr, x);
unitTestZippin(arr, hatNZ);
unitTestCatch(arr, hatNZ, p, x);
unitTestConfidenceInterval(arr, ciZ, "zippin");
unitTestCarleStrub(arr,hatNCS);



//
// 3
//
arr = [5,1,0,0,0,0,0];
hatNZ = 6;
hatNCS = 6;
p = 0.86;
x = 35;
ciZ = 0.00529;

unitTestX(arr, x);
unitTestZippin(arr, hatNZ);
unitTestCatch(arr, hatNZ, p, x);
unitTestConfidenceInterval(arr, ciZ, "zippin");
unitTestCarleStrub(arr,hatNCS);


//
// 4
//
arr =  [34, 46, 22, 26, 18, 16, 20, 12];
hatNZ = 268;
hatNCS = 264;
p = 0.1454;
x = 834;
ciZ = 56.33;

unitTestX(arr, x);
unitTestZippin(arr, hatNZ);
unitTestCatch(arr, hatNZ, p, x);
unitTestConfidenceInterval(arr, ciZ, "zippin");
unitTestCarleStrub(arr,hatNCS);


//
// 5 zippin collapse
//
arr =  [0, 1000];
// hatNZ = collapses
hatNCS = 250749;
unitTestCarleStrub(arr, hatNCS);



//
// 6 --- testing 20, 0, 0, ...
//
arr = [20];
for (var viginti = 0; viginti < 10; viginti++) {
    console.log(arr);
    unitTestZippin(arr, 20);
    unitTestCarleStrub(arr, 20);
    unitTestConfidenceInterval(arr, 0.0, "cs");
    unitTestConfidenceInterval(arr, 0.0, "zippin");
}


//
// ny data fra Marius, 20.07.2015
//

var laks = [32, 40, 12, 19, 9, 7, 8, 5, 2, 3, 1, 1, 0];
var orre = [22,  9,  3,  2, 1, 1, 0, 0, 0, 0, 0, 0, 0];


var laksCS = 140;
var orreCS = 38;
var laksCSci = 3.11;
var orreCSci = 0.06;

var laksZ = 141;
var orreZ = 38;
var laksZci = 3.38;
var orreZci = 0.06;

unitTestCarleStrub(laks, laksCS);
unitTestCarleStrub(orre, orreCS);
unitTestConfidenceInterval(laks, laksCSci, "cs");
unitTestConfidenceInterval(orre, orreCSci, "cs");

unitTestZippin(laks, laksZ);
unitTestZippin(orre, orreZ);
unitTestConfidenceInterval(laks, laksZci, "zippin");
unitTestConfidenceInterval(orre, orreZci, "zippin");
