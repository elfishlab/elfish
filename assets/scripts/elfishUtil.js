/**
 * The number of integer elements of arr.
 */
function ElfishUtilLength(arr) {
    var c = 0;
    for (var i = 0; i < arr.length; i++) {
        if (Number.isInteger(arr[i]))
            c+=1;
    }
    return c;
}

/**
 * True if array contains an integer element.
 */
function ElfishUtilPopulated(arr) {
    return ElfishUtilLength(arr) > 0;
}

/**
 * Returns the sum of the values in arr.
 */
function ElfishUtilSum(arr) {
    var t = 0;
    for (var i = 0; i < arr.length; i++) {
        t += arr[i];
    }
    return t;
}
