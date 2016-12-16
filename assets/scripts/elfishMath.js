
function X(arr) {
    var x = 0;
    var k = arr.length;
    for (var i = 0; i < k; i++) {
        x += (k-(1+i))*arr[i];
    }
    return x;
}

function newT(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}

function newZippin(arr) {
    var t = newT(arr);
    var x = X(arr);
    var k = arr.length;
    var hatN = t-1;
    for (var i = 0; i < 1000000; i++) {
        var lhs = hatN + i;
        var rhs = preEstimate(arr, lhs);
        if (rhs > lhs)
            return lhs;
    }
    console.log("Zippin did not find solution for " + arr);
    return -1;
}




function carleStrubEq(t, hatN, k, x) {
    var prod = 1;
    for (var i = 0; i < k; i++) {
        var j = i+1;
        var teller = k * hatN - x - t + 1+ k - j;
        var nevner = k * hatN - x + 2 + k - j;
        prod *= (teller*1.0) / nevner;
    }
    return t - 1  + ( ( hatN + 1) * prod);
}


function newCarleStrub(arr) {
    var t = newT(arr);
    var x = X(arr);
    var k = arr.length;
    var hatN = t;

    // console.log("newCS N:   " + hatN);
    // console.log("newCS t:   " + t);
    // console.log("newCS x:   " + x);
    // console.log("newCS k:   " + k);

    for (var i = 0; i < 1000000; i++) {
        var lhs = hatN + i;
        var rhs = carleStrubEq(t, lhs, k, x);
        if (lhs >= rhs)
            return lhs;
    }
    console.log("Carle&Strub did not find solution for " + arr);
    return -1;
}













function preEstimate(arr, hatN) {
    var t = newT(arr);
    var x = X(arr);
    var k = arr.length;
    
    var tellerA = (hatN - t + 0.5);
    var tellerB = Math.pow((k * hatN - x), k);
    var nevner = Math.pow((k*hatN  - x - t),k);
    
    return (tellerA * tellerB) / nevner - 0.5;    
}

function newConfidenceInterval(arr) {
    var hatN = newZippin(arr);
    var p = newCatch(arr,hatN);
    var q = 1 - p;
    var k = arr.length;
    
    var qk = Math.pow(q,k);
    
    var teller = hatN * (1 - qk) * qk;
    var nevnerA = Math.pow(1 - qk, 2);
    var nevnerB = Math.pow(p*k, 2) * Math.pow(q,k-1);
    var inni = teller / (nevnerA - nevnerB);
    var sqrt = Math.sqrt(inni);

    return 1.96 * sqrt;
}


/**
* catchability p = T / (kN - X)
*/
function newCatch(arr,hatN) {
    // console.log("newCatch arr\t" + arr);
    // console.log("newCatch N\t" + hatN);
    
    var t = newT(arr);
    var x = X(arr);
    var k = arr.length;
    
    // console.log("newCatch t\t" + t);
    // console.log("newCatch x\t" + x);
    // console.log("newCatch k\t" + k);

    
    var nevner = k * hatN - x;
    
    var ret = t / (1.0*nevner);
    // console.log("newCatch p = " + (Math.round(100*ret) / 100));
    return ret;
}





/**
 * Computes the catchability q = 1-p.
 *
 */
function catchability (arr) {
    window.elfish.unstable = false;
    // k = number of removals
    var k = arr.length;
    
    // TOTAL CATCH
    var totalCatch = sum(arr);
    
    var summand = 0.0;
    for (var i = 1; i < k; i++) {
        summand += (i * arr[i]);
    }
    summand = summand / totalCatch;
    
    // c_0 / T can be used as first guess
    var q = 1 - (arr[0] / totalCatch);
    
    // console.log("init q = " + q);
    
    var sumtwo = (k* Math.pow(q,k)) / (1 - Math.pow(q,k));
    var qinv = 1 - q;
    q = (summand + sumtwo) * qinv;
    // console.log("q = " + q);
    
    for (var i = 0; i < 100; i++) {
	    var oldq=q;
	    sumtwo = (k* Math.pow(q,k)) / (1 - Math.pow(q,k));
	    qinv = 1 - q;
	    q = (summand + sumtwo) * qinv;
	    // console.log("q" + i + " = " + q);
	    if (Math.abs(oldq-q) < 0.00001) {
	        return q;
	    }
    }
    // console.log("Unstable q");
    window.elfish.unstable = true;    
    return q;
}



/**
 * Zippin estimate of N hat of catches given in array arr.
 *
 *
 * Computes T / (1 - q^k)
 * where T = totalCatch (BB4)
 * k = num catch (AG4)
 * q = (1-p) (BV4)
 */
function estimate (arr) {
    return newZippin(arr);
    // // k = number of removals
    // var k = arr.length;
    
    // // TOTAL CATCH
    // var totalCatch = sum(arr);
    
    // var q = catchability(arr);
    // return totalCatch / (1-Math.pow(q,k));
}



/**
 * Computes confidence interval.  If no area is given, assumes 100.
 */
function confidence (arr, area) {
    
    return newConfidenceInterval(arr);
    
    // if (typeof area === "undefined") {
	//     area = 100;
    // }
    
    
    // // k = number of removals
    // var k = arr.length;
    
    // // TOTAL CATCH
    // var totalCatch = sum(arr);
    
    // var q = catchability(arr);
    
    // var qk = Math.pow(q,k);
    
    // var CR4 = totalCatch / (1-Math.pow(q,k));
    
    // // console.log("CR4 = " + CR4);
    
    // // CR4 * (1-(BV4^$AG4)) * BV4^$AG4
    // var CS4numerator = CR4 * (1-qk) * qk;
    
    // // (((1-(qk))^2)-(Math.pow((1-q)*k,2))*(Math.pow(q,k-1)))
    // var CS4denominator = (Math.pow(1-qk,2) - (Math.pow((1-q)*k,2)*(Math.pow(q,k-1))));
    
    // var CS4 = CS4numerator / CS4denominator;
    // // console.log("CS4 = " + CS4);
    
    // var CT4 = Math.sqrt(CS4);
    
    // // console.log("CT4 = " + CT4);
    
    // var CU4 = 1.96 * CT4;
    
    // // console.log("CU4 = " + CU4);
    
    // return CU4/area * 100;
}

/**
 * Gets string 200 &pm; 59*
 */
function getEstimateString(arr) {
    if (arr.length < 2) {
	    return "---";
    }
    
    var q = newZippin(arr);
    var cs = newCarleStrub(arr);
    var cf = newConfidenceInterval(arr);
    var unstable = "";
    if (window.elfish.unstable) {
	    window.elfish.unstable = false;
	    unstable = "*";
    }
    
    return q.toFixed(0) + " &pm; " + cf.toFixed(1) + unstable;
}






/**
 * Gets C&S string 200 &pm; 59*
 */
function getEstimateStringCS(arr) {
    if (arr.length < 2) {
	    return "---";
    }
    
    var cs = newCarleStrub(arr);
    var cf = newConfidenceInterval(arr);
    var unstable = "";
    if (window.elfish.unstable) {
	    window.elfish.unstable = false;
	    unstable = "*";
    }
    
    return cs.toFixed(0) + " &pm; " + cf.toFixed(1) + unstable;
}








/**
 * Returns k/E
 *
 */
function getCIslashE(arr) {
    if (arr.length < 2) {
	    return "---";
    }
    
    // todo precomputed
    var q = estimate(arr);
    var cf = newConfidenceInterval(arr);
    var unstable = "";
    if (window.elfish.unstable) {
	    window.elfish.unstable = false;
	    unstable = "*";
    }
    
    return (cf/q).toFixed(3);
}

function getTE(arr) {
    if (arr.length < 2) {
	    return "---";
    }
    
    var t = sum(arr);
    
    // todo precomputed
    var q = estimate(arr);
    var cf = confidence(arr, 100);
    var unstable = "";
    if (window.elfish.unstable) {
	    window.elfish.unstable = false;
	    unstable = "*";
    }
    
    return (t/q).toFixed(2);
}


/**
 * Returns the sum of the values in arr.
 */
function sum(arr) {
    var t = 0;
    for (var i = 0; i < arr.length; i++) {
	    t += arr[i];
    }
    return t;
}
