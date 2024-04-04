/**
 * functions for validating input
 */

import errorMessage from "./error.js";

const MOD_NAME = "helpers/validation.js";

/**
 * check that the given parameter exists and is a string
 *
 * @param {string} str  input string to be validated
 *
 * @returns {string} trimmed version of str
 * @throws when str is undefined, null, or not a string
 */
const returnValidString = (str) => {
    if (str === undefined || str === null) {
        // check that str exists
        errorMessage(MOD_NAME, "returnValidString", "'str' does not exist!");
    } else if (typeof str !== "string") {
        // check that str is of type string
        errorMessage(
            MOD_NAME,
            "returnValidString",
            `'str' is not a string! got ${str} (${typeof str})`
        );
    }
    return str.trim(); // return trimmed version of str (can be empty)
};

/**
 * checks if an already-validated string is empty, and throws if so
 *
 * @param {string} str   validated string
 *
 * @throws if str is empty
 */
const checkEmptyString = (str) => {
    if (str.length === 0)
        errorMessage(MOD_NAME, "checkEmptyString", "'str' is empty!");
};

/**
 * validates parameters supplied when creating/editing a user's identifying information
 *
 * @param {string} username             login/site handle
 * @param {string} email                registration/login/contact email
 * @param {string} password             login password
 * @param {string} dateOfBirth          date of birth as ISO-formatted date string
 * @param {boolean} publicProfile=true  whether posts and profile data are public to all users
 * @param {string} [name]               display name (optional)
 *
 * @returns {Object} object containing updated and validated paramaters
 * @throws on invalid input
 */
const validateUserParams = (
    username,
    email,
    password,
    dateOfBirth,
    publicProfile = true,
    name
) => {
    username = returnValidString(username);
    checkEmptyString(username);

    email = returnValidString(email);
    checkEmptyString(email);

    password = returnValidString(password);
    checkEmptyString(password);

    dateOfBirth = returnValidString(dateOfBirth);
    checkEmptyString(dateOfBirth);

    if (name !== undefined) {
        // validate name if it is passed as a parameter...
        name = returnValidString(name);
        checkEmptyString(name);
    } else name = null; // ...otherwise null

    if (typeof publicProfile !== "boolean")
        errorMessage(
            MOD_NAME,
            "validateUserParams",
            `'publicProfile' is not a boolean! got ${publicProfile} (${typeof publicProfile})`
        );

    return {
        username: username,
        email: email,
        password: password,
        dateOfBirth: dateOfBirth,
        name: name,
        publicProfile: publicProfile
    };
};

const exportedMethods = {
    returnValidString,
    checkEmptyString,
    validateUserParams
};

export default exportedMethods;
