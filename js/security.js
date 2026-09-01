function encode(arr, factor) {
    return arr.map(value => {
        const result = parseInt(value, 16) * parseInt(factor, 16);
        return result.toString(16);
    }).join("-");
}
function decode(arr, divisor) {
    return arr.map(value => {
        const result = parseInt(value, 16) / parseInt(divisor, 16);
        return result.toString(16);
    });
}
async function fetchAndDecrypt(filename, cipherKey) {
    const response = await fetch(`data/${filename}`);
    const data = await response.arrayBuffer()

    const salt = new TextEncoder().encode(cipherKey[0]);
    const iv = new TextEncoder().encode(cipherKey[1]);
    const passwordKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(cipherKey[2]),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        }, passwordKey, {
            name: "AES-GCM", length: 256
        }, false, ["decrypt"]);


    const decrypted = await crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: iv
    }, key, data);

    return new TextDecoder().decode(decrypted);
}