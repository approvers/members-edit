export const newState = () => {
    const alphaNum =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const array = new Uint8Array(40);
    crypto.getRandomValues(array);
    return String.fromCharCode(
        ...[...array.values()].map(
            (index) => alphaNum.codePointAt(index % alphaNum.length)!,
        ),
    );
};
