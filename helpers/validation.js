/**
 * functions for validating input
 */

import errorMessage from "./error.js";
import { ObjectId } from "mongodb";
import { userData } from "../data/index.js";

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
const validateUserParams = async (
    username,
    password,
    dateOfBirth,
    publicProfile,
    name
) => {
    username = await validateUsername(username);

    password = validatePassword(password);

    dateOfBirth = valiDate(dateOfBirth);

    if (name !== undefined && name !== null) {
        // if not already undefined/null...
        // ...validate name if it is passed as a parameter...
        name = returnValidString(name);
        if (name.length === 0) name = null;
        else if (name.length > 30) {
            errorMessage(
                MOD_NAME,
                "validateUserParams",
                "'name' must not have length greater than 30 chars!"
            );
        }
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
 * checks that the given number is an unsigned integer
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
    return num;
};

/**
 * validates a username and ensures it is not a duplicate
 *
 * @param {string} username     username to be validated
 *
 * @returns {string} fully validated username
 * @throws on invalid username contents or if username is a duplicate
 */
const validateUsername = async (username) => {
    username = returnValidString(username);
    username = username.toLowerCase();

    if (
        username.length < 5 ||
        username.length > 25 ||
        username.match(/\W/g) !== null
    ) {
        errorMessage(MOD_NAME, "validateUsername", "Invalid username");
    }

    const matchingUsername = await userData.findByUsername(username);
    if (matchingUsername !== null) {
        errorMessage(
            MOD_NAME,
            "validateUsername",
            `Username '${username}' already exists!`
        );
    }

    return username;
};

/**
 * validates a password
 *
 * @param {string} password     password to be validated
 *
 * @returns {string} fully validated password
 * @throws on invalid password contents
 */
const validatePassword = (pswd) => {
    pswd = returnValidString(pswd);
    checkEmptyString(pswd);

    const invalidPasswordChars = /[^\w*&%$#@!-]/g; // matches anything not in this character class
    const specialChars = /[_*&%$#@!-]/g;
    if (pswd.length < 8 || pswd.match(invalidPasswordChars) !== null) {
        errorMessage(MOD_NAME, "validatePassword", "Invalid password");
    }
    if (
        pswd.match(specialChars) === null || // at least one special char
        pswd.match(/\d/g) === null || // at least one number
        pswd.match(/[A-Z]/g) === null || // at least one uppercase letter
        pswd.match(/[a-z]/g) === null // at least one lowercase letter
    ) {
        // if any of the following matches are null, password is invalid
        errorMessage(MOD_NAME, "validatePassword", "Invalid password");
    }

    return pswd;
};

/**
 * validates a date of birth string, in the form of 'YYYY-MM-DD'
 *
 * @param {string} dateOfBirth     DOB to be validated
 *
 * @returns {string} fully validated date of birth
 * @throws on invalid date or format
 */
const valiDate = (dateOfBirth) => {
    dateOfBirth = returnValidString(dateOfBirth);
    checkEmptyString(dateOfBirth);

    const dobArray = dateOfBirth.split("-").map((num) => parseInt(num)); // [YYYY, MM, DD]

    if (!Array.isArray(dobArray) || dobArray.length !== 3) {
        errorMessage(MOD_NAME, "valiDate", "Invalid date supplied");
    } else {
        const [year, month, day] = dobArray;
        if (
            // date validation, error triggered if any of the following are true
            year < 0 ||
            month < 0 ||
            month > 11 || // why tf is it month index lmao
            day < 1 ||
            day > 31 || // day must be in [1, 31] or else immediately invalid
            (month === 1 && day > (year % 4 === 0 ? 29 : 28)) || // feb, year % 4 -> leap year, max 29 days, else 28
            ([3, 5, 8, 10].includes(month) && day > 30) // april, june, september, november only have 30 days
        ) {
            errorMessage(MOD_NAME, "valiDate", "Invalid date supplied");
        } else {
            const dateOfBirth = new Date(year, month - 1, day);
            const today = new Date();
            if (
                today.getTime() - dateOfBirth.getTime() <
                3600 * 24 * 365 * 13 * 1000
            ) {
                // 3600 s/hr * 24 hrs/d * 365 d/yr * 13 yrs * 1000 for s -> ms = 13 years in milliseconds
                errorMessage(
                    MOD_NAME,
                    "valiDate",
                    "You must be at least 13 years of age to register for an account"
                );
            }
        }
    }

    return dateOfBirth;
};

const exportedMethods = {
    returnValidString,
    checkEmptyString,
    validateUserParams,
    checkObjectId,
    checkUnsignedInt,
    validateUsername,
    validatePassword,
    valiDate
};

export default exportedMethods;
