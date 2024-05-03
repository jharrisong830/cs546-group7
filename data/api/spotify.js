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
                "getPrivatePlaylistsForPreview",
                "Could not complete API request."
            );
        if (!Object.keys(data).includes("items")) {
            errorMessage(
                MOD_NAME,
                "getPrivatePlaylistsForPreview",
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
 * returns a song subdocument, representing the requested song
 *
 * @param {string} accessToken  user-specific access token for accessing the spotify api
 * @param {string} songId   spotify id for the requested song
 *
 * @returns {Object} song subdocument with the data for songId
 * @throws if input is invalid or if an error occurs in fetching the data
 */
const getSong = async (accessToken, songId) => {
    accessToken = vld.returnValidString(accessToken);
    vld.checkEmptyString(accessToken);

    songId = vld.returnValidString(songId);
    vld.checkEmptyString(songId);

    const accessHeader = {
        Authorization: `Bearer ${accessToken}`
    };

    const { data } = await axios.get(
        `https://api.spotify.com/v1/tracks/${songId}`,
        {
            headers: accessHeader
        }
    );

    if (!data)
        errorMessage(MOD_NAME, "getSong", "Could not complete API request.");
    if (Object.keys(data).includes("error")) {
        errorMessage(
            MOD_NAME,
            "getSong",
            `Response does not contain valid data: ${data}`
        );
    }

    return {
        _id: data.id, // all info is stored within a "track" subobject in the items array
        platform: "SP", // hardcoded bc duh...
        type: "track", // again...
        isrc: data.external_ids.isrc,
        name: data.name,
        artists: data.artists.map((a) => a.name), // extract only the names
        platformURL: data.external_urls.spotify,
        albumId: data.album.id
    };
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
    accessToken = vld.returnValidString(accessToken);
    vld.checkEmptyString(accessToken);

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
                    type: "track", // again...
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

/**
 * returns a playlist subdocument, representing the requested playlist
 *
 * @param {string} accessToken  user-specific access token for accessing the spotify api
 * @param {string} playlistId   spotify id for the requested playlist
 *
 * @returns {Object} playlist subdocument with the data for playlistId
 * @throws if input is invalid or if an error occurs in fetching the data
 */
const getPlaylist = async (accessToken, playlistId) => {
    accessToken = vld.returnValidString(accessToken);
    vld.checkEmptyString(accessToken);

    playlistId = vld.returnValidString(playlistId);
    vld.checkEmptyString(playlistId);

    const accessHeader = {
        Authorization: `Bearer ${accessToken}`
    };

    const { data } = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
            headers: accessHeader,
            params: { fields: "id,name,external_urls.spotify" }
        }
    );

    if (!data)
        errorMessage(
            MOD_NAME,
            "getPlaylist",
            "Could not complete API request."
        );
    if (Object.keys(data).includes("error")) {
        errorMessage(
            MOD_NAME,
            "getPlaylist",
            `Response does not contain valid data: ${data}`
        );
    }

    const tracks = await getPlaylistTracks(accessToken, playlistId);

    return {
        _id: data.id,
        platform: "SP", // hardcode platform and type!
        type: "playlist",
        name: data.name,
        platformURL: data.external_urls.spotify,
        tracks: tracks,
        ratings: [] // no ratings at time of fetch!
    };
};

/**
 * returns an album subdocument, representing the requested album
 *
 * @param {string} accessToken  user-specific access token for accessing the spotify api
 * @param {string} albumId      spotify id for the requested album
 *
 * @returns {Object} album subdocument with the data for albumId
 * @throws if input is invalid or if an error occurs in fetching the data
 */
const getAlbum = async (accessToken, albumId) => {
    accessToken = vld.returnValidString(accessToken);
    vld.checkEmptyString(accessToken);

    albumId = vld.returnValidString(albumId);
    vld.checkEmptyString(albumId);

    const accessHeader = {
        Authorization: `Bearer ${accessToken}`
    };

    const { data } = await axios.get(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
            headers: accessHeader
        }
    );

    if (!data)
        errorMessage(MOD_NAME, "getAlbum", "Could not complete API request.");
    if (Object.keys(data).includes("error")) {
        errorMessage(
            MOD_NAME,
            "getAlbum",
            `Response does not contain valid data: ${data}`
        );
    }

    return {
        _id: data.id,
        platform: "SP",
        type: "album",
        name: data.name,
        artists: data.artists.map((a) => a.name), // extract only the names
        platformURL: data.external_urls.spotify,
        tracks: [] // TODO
    };
};

/**
 * searches the spotify catalog for items matching the search string
 * @param {string} accessToken  user-specific access token for accessing the spotify api
 * @param {string} str          search query string
 *
 * @returns {[Object]} results from the spotify catalog
 * @throws if input is invalid or if an error occurs in fetching the data
 */
const searchCatalog = async (accessToken, str) => {
    accessToken = vld.returnValidString(accessToken);
    vld.checkEmptyString(accessToken);

    str = vld.returnValidString(str);
    if (str.length === 0) return []; // no need to throw error, just return empty array on empty input

    const accessHeader = {
        Authorization: `Bearer ${accessToken}`
    };

    const { data } = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: accessHeader,
        params: {
            q: str.replace(/\s/g, "%20"), // replace all whitespace with +
            type: "album,track"
        }
    });

    if (!data)
        errorMessage(
            MOD_NAME,
            "searchCatalog",
            "Could not complete API request."
        );
    if (Object.keys(data).includes("error")) {
        errorMessage(
            MOD_NAME,
            "searchCatalog",
            `Response does not contain valid data: ${data}`
        );
    }

    let results = [];

    results.push(
        ...data.tracks.items.map((song) => ({
            _id: song.id, // all info is stored within a "track" subobject in the items array
            platform: "SP", // hardcoded bc duh...
            type: "track", // again...
            isrc: song.external_ids.isrc,
            name: song.name,
            artists: song.artists.map((a) => a.name), // extract only the names
            platformURL: song.external_urls.spotify,
            albumId: song.album.id
        }))
    );

    results.push(
        ...data.albums.items.map((album) => ({
            _id: album.id,
            platform: "SP",
            type: "album",
            name: album.name,
            artists: album.artists.map((a) => a.name), // extract only the names
            platformURL: album.external_urls.spotify,
            tracks: [] // TODO
        }))
    );

    return results;
};

/**
 * returns thumbnail artwork of the requested album
 *
 * @param {string} accessToken  user-specific access token for accessing the spotify api
 * @param {string} albumId      spotify id for the requested album
 *
 * @returns {string | null} url link to artwork, null if artwork does not exist
 * @throws if input is invalid or if an error occurs in fetching the data
 */
const getArtwork = async (accessToken, albumId) => {
    accessToken = vld.returnValidString(accessToken);
    vld.checkEmptyString(accessToken);

    albumId = vld.returnValidString(albumId);
    vld.checkEmptyString(albumId);

    const accessHeader = {
        Authorization: `Bearer ${accessToken}`
    };

    const { data } = await axios.get(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
            headers: accessHeader
        }
    );

    if (!data)
        errorMessage(MOD_NAME, "getArtwork", "Could not complete API request.");
    if (Object.keys(data).includes("error")) {
        errorMessage(
            MOD_NAME,
            "getArtwork",
            `Response does not contain valid data: ${data}`
        );
    }

    return Object.keys(data).includes("images") && data.images.length > 0
        ? data.images[0].url
        : null;
};

const exportedMethods = {
    getUserId,
    getPrivatePlaylistsForPreview,
    getPlaylistTracks,
    getPlaylist,
    searchCatalog,
    getSong,
    getAlbum,
    getArtwork
};

export default exportedMethods;
