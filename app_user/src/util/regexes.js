//? Minimum 8 characters: of which at least one uppercaseletter, one lowercase letter, one special character and one number
export const validatePassword = (password) => {
    const passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

    return passwordRegex.test(String(password))
}

export const validateUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    return uuidRegex.test(String(uuid))
}