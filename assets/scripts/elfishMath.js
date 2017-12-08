// ElfishMath public functions
//
// float  ElfishMathConfidenceInterval( data, method )
// float  ElfishMathEstimate ( data, method )
// string ElfishMathEstimateString ( data, method )
// float  ElfishMathCISlashE ( data, method )
// float  ElfishMathTSlashE ( data, method )
// bool   ElfishMathIsConfident (data, confidence, meth)

function ElfishMathConfidenceInterval(arr, meth) {
    if (!ElfishUtilPopulated(arr)) return -1;

    var hatN = -1;
    if (meth == "zippin")
        hatN = ElfishMathZippin(arr);
    else
        hatN = ElfishMathCarleStrub(arr);
    var p = ElfishMathCatch(arr,hatN);
    var q = 1 - p;
    var k = ElfishMathK(arr);

    var qk = Math.pow(q,k);

    var teller = hatN * (1 - qk) * qk;
    var nevnerA = Math.pow(1 - qk, 2);
    var nevnerB = Math.pow(p*k, 2) * Math.pow(q,k-1);
    var inni = teller / (nevnerA - nevnerB);
    var sqrt = Math.sqrt(inni);

    return 1.96 * sqrt;
}


/**
 * estimate of N hat of catches given in array arr.
 * If meth == "zippin", use Zippin, else Carle & Strub.
 *
 * Computes T / (1 - q^k)
 * where T = totalCatch (BB4)
 * k = num catch (AG4)
 * q = (1-p) (BV4)
 */
function ElfishMathEstimate(arr, meth) {
    var t_start = performance.now();
    var val = -1;
    if (!ElfishUtilPopulated(arr))
        val = -1;
    else if (meth == "zippin")
        val = ElfishMathZippin(arr);
    else
        val = ElfishMathCarleStrub(arr);
    var t_end = performance.now();
    var t_time = (t_end - t_start).toFixed(2);
    console.log("ElfishMathEstimate(" + arr + "," + meth + ") = " + val + " took " + t_time + "  ms");
    return val;
}


/**
 * Gets string 200 &pm; 59*
 */
function ElfishMathEstimateString(arr, meth) {
    if (!ElfishUtilPopulated(arr)) return "---";

    var est = -1;
    var cf  = -1;
    if (meth == "zippin") {
        est = ElfishMathZippin(arr);
        cf  = ElfishMathConfidenceInterval(arr, meth);
    } else {
        est = ElfishMathCarleStrub(arr);
        cf  = ElfishMathConfidenceInterval(arr, meth);
    }
    if (est >= 0 && cf >= 0)
        return est.toFixed(0) + " &pm; " + cf.toFixed(1);
    return "N/A";
}


/**
 * Returns whether cf/est <= confidence for given data and method.
 */
function ElfishMathIsConfident(arr, confidence, meth) {
    if (!ElfishUtilPopulated(arr)) return false;
    var q = ElfishMathEstimate(arr, meth);
    var cf = ElfishMathConfidenceInterval(arr, meth);
    if (q < 0 || cf < 0)
        return false;
    return (cf/q) <= confidence;
}


/**
 * Returns cf/est for given method.
 *
 */
function ElfishMathCIslashE(arr, meth) {
    if (!ElfishUtilPopulated(arr)) return -1;

    // todo precomputed
    var q  = ElfishMathEstimate(arr, meth);
    var cf = ElfishMathConfidenceInterval(arr, meth);

    return cf/q;
}


/**
 *
 */
function ElfishMathTSlashE(arr, meth) {
    if (!ElfishUtilPopulated(arr)) return -1;

    var t = ElfishUtilSum(arr);
    var q = ElfishMathEstimate(arr, meth);

    return t / q;
}









// PRIVATE FUNCTIONS FOR ElfishMath (may be used in unit tests)
//
// float ElfishMathX ( data )
// float ElfishMathT ( data )
// float ElfishMathZippin ( data )
// float ElfishMathCarleStrubEq ( data )
// float ElfishMathCarleStrub ( data )
// float ElfishMathPreEstimate ( data, hatN )
// float ElfishMathCatch ( data, hatN )


/**
 *  returns the X of the Carle & Strub equation
 */
function ElfishMathX(arr) {
    var x = 0;
    var k = ElfishMathK(arr);
    for (var i = 0; i < arr.length; i++) {
        x += (k-(1+i))*arr[i]; // TODO handle if arr[i] = ""
    }
    return x;
}

/**
 *  Returns the T of the Carle & Strub equation, which is the sum of data.
 */
function ElfishMathT(arr) {
    return ElfishUtilSum(arr);
}

/**
 *  Returns the number of integers in arr.
 */
function ElfishMathK(arr) {
    return ElfishUtilLength(arr);
}




/**
 *  Computes the Zippin estimate of given data arr.
 *
 *  Returns -1 if no convergence in 1M steps.
 */
function ElfishMathZippin(arr) {
    if (!ElfishUtilPopulated(arr)) return -1;
    var t = ElfishMathT(arr);
    var x = ElfishMathX(arr);
    var k = ElfishMathK(arr);
    var z_min = ((t-1)*(k-1)/2)-1; // X must be greater than z_min
    if (x <= z_min) {
        console.log("Zippin X below z_min for " + arr);
        return -1;
    }
    var hatN = t;
    for (var i = 0; i < window.elfish.upperlimit; i++) {
        var lhs = hatN + i;
        var rhs = ElfishMathPreEstimate(arr, lhs);
        if (rhs > lhs)
            return lhs;
    }
    console.log("Zippin did not find solution for " + arr);
    return -1;
}


/**
 *  Helper function only used in ElfishMathCarleStrub.
 *
 *  Returns the actual value of the RHS of equation.
 */
function ElfishMathCarleStrubEq(t, hatN, k, x) {
    var prod = 1;
    for (var i = 0; i < k; i++) {
        var j = i+1;
        var teller = k * hatN - x - t + 1+ k - j;
        var nevner = k * hatN - x + 2 + k - j;
        prod *= (teller*1.0) / nevner;
    }
    return t - 1  + ( ( hatN + 1) * prod);
}


/**
 *  Computes the C&S estimate of given data arr.
 *
 *  Returns -1 if no convergence in 1M steps.
 */
function ElfishMathCarleStrub(arr) {
    if (!ElfishUtilPopulated(arr)) return -1;

    var t = ElfishMathT(arr);
    var x = ElfishMathX(arr);
    var k = ElfishMathK(arr);
    var hatN = t;

    for (var i = 0; i < window.elfish.upperlimit; i++) {
        var lhs = hatN + i;
        var rhs = ElfishMathCarleStrubEq(t, lhs, k, x);
        if (lhs >= rhs)
            return lhs;
    }
    console.log("Carle&Strub did not find solution for " + arr);
    return -1;
}


/**
 *  Pre estimate used to bootstrap Zippin.
 */
function ElfishMathPreEstimate(arr, hatN) {
    if (!ElfishUtilPopulated(arr)) return -1;

    var t = ElfishMathT(arr);
    var x = ElfishMathX(arr);
    var k = ElfishMathK(arr);

    var tellerA = (hatN - t + 0.5);
    var tellerB = Math.pow((k * hatN - x)    , k);
    var nevner  = Math.pow((k * hatN - x - t), k);

    return (tellerA * tellerB) / nevner - 0.5;
}


/**
 *  Computes the catchability p = T / (kN - X).
 *
 *  This is used together with estimate to give the confidence.
 */
function ElfishMathCatch(arr,hatN) {
    if (!ElfishUtilPopulated(arr)) return -1;

    var t = ElfishMathT(arr);
    var x = ElfishMathX(arr);
    var k = ElfishMathK(arr);

    var nevner = k * hatN - x;

    var ret = t / (1.0*nevner);
    return ret;
}
