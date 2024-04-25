/**
 * funcs for apple music api
 */

import axios from "axios";
import vld from "../../helpers/validation.js";
import errorMessage from "../../helpers/error.js";
import { AMGenerateDevToken } from "../../helpers/authentication.js";

const MOD_NAME = "data/api/appleMusic.js";

/**
 * returns the owned/followed playlists for the user providing the music user token
 * data is abbreviated since we are only fetching playlists to add to a profile/post, we don't need the tracks yet
 *
 * @param {string} musicUserToken  user-specific access token for accessing the apple music api
 * @param {string} AMDevToken      JWT developer token
 *
 * @returns {[Object]} an array of playlist subdocuments, with abbreviated data
 * @throws if input is invalid or if an error occurs in fetching the data
 */
const getLibraryPlaylistsForPreview = async (AMDevToken, musicUserToken) => {
    AMDevToken = vld.returnValidString(AMDevToken);
    vld.checkEmptyString(AMDevToken);

    musicUserToken = vld.returnValidString(musicUserToken);
    vld.checkEmptyString(musicUserToken);

    const accessHeader = {
        Authorization: `Bearer ${AMDevToken}`,
        "Music-User-Token": musicUserToken
    };

    const { data } = await axios.get(
        "https://api.music.apple.com/v1/me/library/playlists",
        {
            headers: accessHeader
        }
    );

    if (!data)
        errorMessage(
            MOD_NAME,
            "getLibraryPlaylistsForPreview",
            "Could not complete API request."
        );
    if (!Object.keys(data).includes("data")) {
        errorMessage(
            MOD_NAME,
            "getPlaylistTracks",
            `Response does not contain 'data': ${data}`
        );
    }

    return data.data.map((pl) => ({
        // filter out unnecessary data (unfortunately this is all i can get :( )
        _id: pl.id,
        name: pl.attributes.name
    }));
};

const exportedMethods = {
    getLibraryPlaylistsForPreview
};

export default exportedMethods;
