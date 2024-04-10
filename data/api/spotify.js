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

/**
 * returns the owned/followed playlists for the user providing the access token
 * data is abbreviated since we are only fetching playlists to add to a profile/post, we don't need the tracks yet
 *
 * @param {string} accessToken  user-specific access token for accessing the spotify api
 *
 * @returns {[Object]} an array of playlist subdocuments, with abbreviated data
 * @throws if input is invalid or if an error occurs in fetching the data
 */
const getPrivatePlaylistsForPreview = async (accessToken) => {
    accessToken = vld.returnValidString(accessToken);
    vld.checkEmptyString(accessToken);

    let allPlaylists = [];
    const userId = await getUserId(accessToken);

    const accessHeader = {
        Authorization: `Bearer ${accessToken}`
    };

    let nextPage = "https://api.spotify.com/v1/me/playlists?limit=10"; // setting the initial url as the first page

    do {
        let data = (
            await axios.get(nextPage, {
                headers: accessHeader
            })
        ).data; // avoids scoping issues

        if (!data)
            errorMessage(
                MOD_NAME,
                "getPrivatePlaylists",
                "Could not complete API request."
            );
        if (!Object.keys(data).includes("items")) {
            errorMessage(
                MOD_NAME,
                "getPrivatePlaylists",
                `Response does not contain 'items': ${data}`
            );
        }

        allPlaylists.push(
            ...data.items // ... to unpack the array into varargs
                .filter((pl) => pl.owner.id === userId) // get only the playlists owned by the current user
                .map((pl) => ({
                    // transform into our playlist subdocument, filter out extra data, etc...
                    _id: pl.id, // use this to get the tracks later
                    name: pl.name,
                    totalTracks: pl.tracks.total,
                    platformURL: pl.external_urls.spotify,
                    // null if there are no images
                    thumbnailURL:
                        Object.keys(pl).includes("images") &&
                        pl.images.length > 0
                            ? pl.images[0].url
                            : null
                }))
        );

        nextPage = data.next; // get the next page url

        // allPlaylists.push(data.items
        //     .filter((pl) => pl.owner.id === userId) // get only the playlists owned by the current user
        //     .map((pl) => ({ // transform into our playlist subdocument, filter out extra data, etc...
        //         _id: pl.id,
        //         platform: "SP", // we are in the spotify file, so we hardcode this lmao
        //         type: "playlist", // hardcode again lol
        //         name: pl.name,
        //         platformURL: pl.external_urls.spotify,
        //         tracks: null, // TODO: when do we populate this???
        //         ratings: [] // if we're fetching it to be added, then there's no ratings added yet...
        //     }))
        // );
    } while (nextPage); // continue while next page is not null

    return allPlaylists;
};

const exportedMethods = {
    getUserId,
    getPrivatePlaylistsForPreview
};

export default exportedMethods;
