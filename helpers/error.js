/**
 * methods for generating error messages and throwing errors
 */

const MOD_NAME = "helpers/error.js";

/**
 * error message wrapper used to generate error messages and avoid boilerplate
 *
 * @param {string} modName      name of original file
 * @param {string} funcName     name of caller function
 * @param {string} msg          custom error message to be printed
 *
 * @throws ALWAYS
 */
const errorMessage = (modName, funcName, msg) => {
    throw `ERROR in ${modName} / ${funcName}: \n\t${msg}`;
};

export default errorMessage;
