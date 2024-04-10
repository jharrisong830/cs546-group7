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
                    // filter out unnecessary data
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
    } while (nextPage); // continue while next page is not null

    return allPlaylists;
};

/**
 * returns an array of song subdocuments, being all of the tracks
 *
 * @param {string} accessToken  user-specific access token for accessing the spotify api
 * @param {string} playlistId   spotify id for the requested playlist
 *
 * @returns {[Object]} song subdocuments representing the tracks of the playlist
 * @throws if input is invalid or if an error occurs in fetching the data
 */
const getPlaylistTracks = async (accessToken, playlistId) => {
    playlistId = vld.returnValidString(playlistId);
    vld.checkEmptyString(playlistId);

    let allTracks = [];

    const accessHeader = {
        Authorization: `Bearer ${accessToken}`
    };

    let nextPage = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`; // setting the initial url as the first page

    do {
        let data = (
            await axios.get(nextPage, {
                headers: accessHeader
            })
        ).data; // avoids scoping issues

        if (!data)
            errorMessage(
                MOD_NAME,
                "getPlaylistTracks",
                "Could not complete API request."
            );
        if (!Object.keys(data).includes("items")) {
            errorMessage(
                MOD_NAME,
                "getPlaylistTracks",
                `Response does not contain 'items': ${data}`
            );
        }

        allTracks.push(
            ...data.items // ... to unpack the array into varargs
                .map((song) => ({
                    // transform into our song subdocument, filter out extra data, etc...
                    _id: song.track.id, // all info is stored within a "track" subobject in the items array
                    platform: "SP", // hardcoded bc duh...
                    type: "song", // again...
                    isrc: song.track.external_ids.isrc,
                    name: song.track.name,
                    artists: song.track.artists.map((a) => a.name), // extract only the names
                    platformURL: song.track.external_urls.spotify,
                    albumId: song.track.album.id
                }))
        );

        nextPage = data.next; // get the next page url
    } while (nextPage); // continue while next page is not null

    return allTracks;
};

const exportedMethods = {
    getUserId,
    getPrivatePlaylistsForPreview,
    getPlaylistTracks
};

export default exportedMethods;
