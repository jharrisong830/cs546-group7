/**
 * functions for handling api authorization flows for spotify, apple music, and other services
 */

import { config } from "dotenv";
import errorMessage from "./error.js";
import jwt from "jsonwebtoken";

const MOD_NAME = "helpers/authentication.js";

config();

const pkcePossible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.~";

/**
 * builds the URL for the initial spotify authorization
 *
 * redirects to spotify login, which returns authorization code on success
 *
 * @param {codeChallenge}   PKCE code challenge to be sent as a query param
 *
 * @returns {string}    authorization endpoint used to get user authorization code
 */
const SPGetAuthorizationURL = (codeChallenge) => {
    const scope = "playlist-read-private user-read-private user-library-read"; // TODO: refine scopes to be minimal
    const userAuthQuery = {
        response_type: "code",
        redirect_uri: process.env.SPOTIFY_REDIRECT,
        client_id: process.env.SPOTIFY_CLIENT,
        scope: scope,
        code_challenge_method: "S256",
        code_challenge: codeChallenge
    };

    const authURL =
        "https://accounts.spotify.com/authorize?" + // construct http query
        Object.keys(userAuthQuery)
            .map((currKey) => `${currKey}=${userAuthQuery[currKey]}`)
            .join("&");

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
    if (typeof length !== "number")
        errorMessage(
            MOD_NAME,
            "generatePKCEString",
            `invalid length, expected type number, received ${typeof length} (${length})`
        );
    if (length < 43 || length > 128 || length % 1 !== 0) {
        errorMessage(
            MOD_NAME,
            "generatePKCEString",
            `invalid length, expected integer in [43, 128], received ${length}`
        );
    }

    const randVals = crypto.getRandomValues(new Uint8Array(length)); // fill a byte array of size length with random values
    return randVals.reduce(
        (acc, curr) => acc + pkcePossible[curr % pkcePossible.length],
        ""
    ); // get each character in the string
};

/**
 * encrypt str with sha256 algorithm
 *
 * reference for implementation: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 *
 * @param {string} str  message to be encrypted
 *
 * @returns {ArrayBuffer} sha256 encrypted message buffer
 */
const encrypt = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return await crypto.subtle.digest("SHA-256", data); // encrypt with sha256 algo
};

/**
 * base-64 encode a byte buffer
 *
 * reference for implementation: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 *
 * @param {ArrayBuffer} buf   buffer to be encoded
 *
 * @returns {string} base-64 encoded buffer
 */
const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

/**
 * returns a triplet of PKCE codes to use for authorization
 *
 * @param {number} length   length of the randomly generated string
 *
 * @returns {Object} containing codeVerifier, hashed, and codeChallenge
 * @throws when length is invalid
 */
const getPKCECodes = async (length = 64) => {
    const codeVerifier = generatePKCEString(length); // will throw with incorrect length
    const hashed = await encrypt(codeVerifier);
    const codeChallenge = base64encode(hashed);

    return {
        codeVerifier: codeVerifier,
        hashed: hashed,
        codeChallenge: codeChallenge
    };
};

/**
 * generates a JSON Web Token (JWT) signed developer token used to access the apple music api
 *
 * @returns {string}    signed JWT developer token
 */
export const AMGenerateDevToken = () => {
    let secret = process.env.AM_SECRET;
    secret = secret.replaceAll("\\n", "\n"); // replace all "\n" literals with proper newline
    const header = {
        alg: "ES256",
        kid: process.env.AM_KEY_ID
    };

    const currTime = Math.floor(new Date().getTime() / 1000); // unix epoch in seconds
    const payload = {
        iss: process.env.AM_TEAM_ID,
        iat: currTime,
        exp: currTime + 3600 // expires in one hour
    };

    return jwt.sign(payload, secret, { header: header }); // return the encoded dev token
};

const exportedMethods = {
    SPGetAuthorizationURL,
    getPKCECodes,
    AMGenerateDevToken
};

export default exportedMethods;
