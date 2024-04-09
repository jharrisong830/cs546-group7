/**
 * funcs for spotify api
 */

import axios from "axios";
import vld from "../../helpers/validation.js";
import errorMessage from "../../helpers/error.js";

const MOD_NAME = "data/api/spotify.js";

/**
 * returns the spotify user id for the user providing the access token
 * @param {string} accessToken  user-specific access token for accessing the spotify api
 *
 * @returns {string} spotify user id
 * @throws if input is invalid or if an error occurs in fetching the data
 */
const getUserId = async (accessToken) => {
    accessToken = vld.returnValidString(accessToken);
    vld.checkEmptyString(accessToken);

    const accessHeader = {
        Authorization: `Bearer ${accessToken}`
    };

    const { data } = await axios.get("https://api.spotify.com/v1/me", {
        headers: accessHeader
    });

    if (!data)
        errorMessage(MOD_NAME, "getUserId", "Could not complete API request.");

    if (!Object.keys(data).includes("id")) {
        errorMessage(
            MOD_NAME,
            "getUserId",
            `Response does not contain 'id': ${data}`
        );
    }
    return data.id; // return the id
};

const exportedMethods = {
    getUserId
};

export default exportedMethods;
