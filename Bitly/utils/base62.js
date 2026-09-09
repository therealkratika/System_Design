const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeBase62(value) {
    let number = BigInt(value);
    if (number === 0n) return "0";

    let result = "";

    while (number > 0n) {
        result = characters[Number(number % 62n)] + result;
        number /= 62n;
    }

    return result;
}

module.exports = encodeBase62;