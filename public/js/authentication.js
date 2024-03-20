/**
 * functions for handling api authorization flows for spotify, apple music, and other services
 */

import { config } from "dotenv";
import errorMessage from "./error.js";

const MOD_NAME = "authentication.js";

config();

const pkcePossible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.~";


/**
 * builds the URL for the initial spotify authorization 
 * 
 * redirects to spotify login, which returns authorization code on success
 * 
 * @returns {string}    authorization endpoint used to get user authorization code
 */
const getSpotifyAuthorizationURL = () => {
    const scope = "playlist-read-private user-read-private user-library-read"; // TODO: refine scopes to be minimal
    const userAuthQuery = {
        response_type: "code",
        redirect_uri: process.env.SPOTIFY_REDIRECT,
        client_id: process.env.SPOTIFY_CLIENT,
        scope: scope
    };

    const authURL = "https://accounts.spotify.com/authorize?" + // construct http query
        Object.keys(userAuthQuery).map((currKey) => `${currKey}=${userAuthQuery[currKey]}`).join("&");
    
    return authURL;
};


/**
 * generates a cryptographically secure string of given length in [43, 128] according to the PKCE protocol
 * 
 * reference for implementation: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 * 
 * @param {number} length   length of the randomly generated string
 * 
 * @returns {string} randomly generated string according to PKCE standard
 * @throws when length is invalid
 */
const generatePKCEString = (length = 64) => {
    if (typeof length !== 'number') errorMessage(MOD_NAME, "generatePKCEString", `invalid length, expected type number, received ${typeof length} (${length})`);
    if (length < 43 || length > 128 || length % 1 !== 0) {
        errorMessage(MOD_NAME, "generatePKCEString", `invalid length, expected integer in [43, 128], received ${length}`);
    }

    const randVals = crypto.getRandomValues(new Uint8Array(length)); // fill a byte array of size length with random values
    return randVals.reduce((acc, curr) => acc + pkcePossible[curr % pkcePossible.length], ""); // get each character in the string
};




const exportedMethods = {
    getSpotifyAuthorizationURL,
    generatePKCEString
};



export default exportedMethods;
