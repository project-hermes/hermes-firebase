export function validateEmail(str) {
    return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(
        str
    );
}

export function validatePassword(str) {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm.test(str);
}

export function validateDisplayName(str) {
    return /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim.test(str);
}
