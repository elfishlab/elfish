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
 * estimate of N hat of catches given in array arr.
 * If meth == "zippin", use Zippin, else Carle & Strub.
 *
 * Computes T / (1 - q^k)
 * where T = totalCatch (BB4)
 * k = num catch (AG4)
 * q = (1-p) (BV4)
 */
function ElfishMathEstimate(arr, meth) {
    if (!ElfishUtilPopulated(arr)) return -1;
    if (meth == "zippin")
        return ElfishMathZippin(arr);
    else
        return ElfishMathCarleStrub(arr);
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
    var unstable = "";
    if (window.elfish.unstable) {
        window.elfish.unstable = false;
        unstable = "*";
    }
    return est.toFixed(0) + " &pm; " + cf.toFixed(1) + unstable;
}


/**
 * Returns whether cf/est <= confidence for given data and method.
 */
function ElfishMathIsConfident(arr, confidence, meth) {
    if (!ElfishUtilPopulated(arr)) return false;
    var q = ElfishMathEstimate(arr, meth);
    var cf = ElfishMathConfidenceInterval(arr, meth);
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
    if (window.elfish.unstable)
        window.elfish.unstable = false;

    return cf/q;
}


/**
 *
 */
function ElfishMathTSlashE(arr, meth) {
    if (!ElfishUtilPopulated(arr)) return -1;

    var t = ElfishUtilSum(arr);
    var q = ElfishMathEstimate(arr, meth);
    if (window.elfish.unstable)
        window.elfish.unstable = false;

    return (1.0 * t) / q;
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
    var k = arr.length;
    for (var i = 0; i < k; i++) {
        x += (k-(1+i))*arr[i];
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
 *  Computes the Zippin estimate of given data arr.
 *
 *  Returns -1 if no convergence in 1M steps.
 */
function ElfishMathZippin(arr) {
    if (!ElfishUtilPopulated(arr)) return -1;
    var t = ElfishMathT(arr);
    var x = ElfishMathX(arr);
    var k = arr.length;
    var hatN = t;
    for (var i = 0; i < 1000000; i++) {
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
    var k = arr.length;
    var hatN = t;

    for (var i = 0; i < 1000000; i++) {
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
    var k = arr.length;

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
    var k = arr.length;

    var nevner = k * hatN - x;

    var ret = t / (1.0*nevner);
    return ret;
}
