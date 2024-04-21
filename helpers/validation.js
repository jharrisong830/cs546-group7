/**
 * functions for validating input
 */

import errorMessage from "./error.js";
import { ObjectId } from "mongodb";

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
 * @param {string} password             login password
 * @param {string} dateOfBirth          date of birth as ISO-formatted date string
 * @param {boolean} publicProfile       whether posts and profile data are public to all users
 * @param {string} [name]               display name (optional)
 *
 * @returns {Object} object containing updated and validated paramaters
 * @throws on invalid input
 */
const validateUserParams = (
    username,
    password,
    dateOfBirth,
    publicProfile,
    name
) => {
    username = returnValidString(username); // TODO: character validation for different fields
    checkEmptyString(username);
    username = username.toLowerCase(); // case insensitive

    password = returnValidString(password);
    checkEmptyString(password);

    dateOfBirth = returnValidString(dateOfBirth);
    checkEmptyString(dateOfBirth);

    if (name !== undefined) {
        // validate name if it is passed as a parameter...
        name = returnValidString(name);
        if (name.length === 0) name = null;
    } else name = null; // ...otherwise null

    if (typeof publicProfile !== "boolean")
        errorMessage(
            MOD_NAME,
            "validateUserParams",
            `'publicProfile' is not a boolean! got ${publicProfile} (${typeof publicProfile})`
        );

    return {
        username: username,
        password: password,
        dateOfBirth: dateOfBirth,
        name: name,
        publicProfile: publicProfile
    };
};

/**
 * checks that the given id is a valid object id, and returns it as an ObjectId
 * @param {string | ObjectId} id   to be validated
 *
 * @returns {ObjectId}  above id converted to ObjectId
 * @throws if id is not a valid ObjectId or string
 */
const checkObjectId = (id) => {
    if (id === undefined || id === null) {
        errorMessage(MOD_NAME, "checkObjectId", "'id' does not exist!");
    }
    if (typeof id === "object" && ObjectId.isValid(id)) {
        // if already given an ObjectId instance, return it!
        return id;
    }
    // otherwise, validate the string (or throw for invalid types)
    id = returnValidString(id);
    checkEmptyString(id);
    if (!ObjectId.isValid(id)) {
        errorMessage(
            MOD_NAME,
            "checkObjectId",
            `'${id}' is not a valid ObjectId`
        );
    }
    return new ObjectId(id); // return validated ObjectId instance
};

/**
 * checks that the given number is a unsigned integer
 *
 * @param {number} num  number to be validated
 *
 * @throws if number does not exist, is not a number, or is not an unsigned integer
 */
const checkUnsignedInt = (num) => {
    if (num === undefined || num === null) {
        errorMessage(MOD_NAME, "checkUnsignedInt", "'num' does not exist!");
    }
    if (typeof num !== "number") {
        errorMessage(
            MOD_NAME,
            "checkUnsignedInt",
            `'num' is not a number! got ${typeof num}`
        );
    }
    if (num < 0)
        errorMessage(
            MOD_NAME,
            "checkUnsignedInt",
            `'num' must be positive! got ${num}`
        );
    if (num % 1 !== 0)
        errorMessage(
            MOD_NAME,
            "checkUnsignedInt",
            `'num' must be an integer! got ${num}`
        );
};

const exportedMethods = {
    returnValidString,
    checkEmptyString,
    validateUserParams,
    checkObjectId,
    checkUnsignedInt
};

export default exportedMethods;
