



export const verifyPasswordStrength = (password: string) => {

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    const isStrong = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    return isStrong;
}

export const generateRandomCharacters = (length: number) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomChars = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomChars += charset[randomIndex];
    }

    return randomChars;
}

export const validateName = (name: string)=> {
    const nameRegex = /^[a-zA-Z'-]{2,}$/;

    return nameRegex.test(name);
}
