/**
 * debug routes
 */

import { Router } from "express";
import { userData } from "../data/index.js";
import spotify from "../data/api/spotify.js";
import appleMusic from "../data/api/appleMusic.js";

const router = Router();

router.route("/").get(async (req, res) => {
    const SAMPLE_DATA = {
        username: "jgraham5",
        email: "jgraham5@stevens.edu",
        password: "1234",
        dateOfBirth: "08/30/2003"
    };

    try {
        let inserted = await userData.registerUser(
            SAMPLE_DATA.username,
            SAMPLE_DATA.email,
            SAMPLE_DATA.password,
            SAMPLE_DATA.dateOfBirth
        );
        await userData.addSPAccessData(
            inserted._id,
            "BQDuFPJ3xi0zzLGTklJ3jnfFHiC3e_DY23X53ebQRp0-98PTMYjS5r7vPi0p5oSqQo1sZ0PR02RSLAjJsW6ytC-pzUZsuXxUGbt-7lwCWteSU7gHikf27LmQHY0ruV442xEFYtWU4N8fBkQWTvX34FlDt8kpeXsVrEPzswIUJBC_LlxvlakiRcMT8JltdoLFmwpD_4jQMCdo-hQ_wztboP2ie_4w4axSbvqckmMA",
            42069,
            "edf"
        ); // test inserting SPAuth subdoc
        let updated = await userData.getUser(inserted._id);
        // let SPid = await spotify.getUserId(updated.SPAuth.accessToken);
        let playlists = await spotify.getPrivatePlaylistsForPreview(
            updated.SPAuth.accessToken
        );
        let firstPlaylistSongs = await spotify.getPlaylistTracks(
            updated.SPAuth.accessToken,
            playlists[0]._id
        );
        let search = await spotify.searchCatalog(
            updated.SPAuth.accessToken,
            "never gonna give you up"
        );

        let song = await spotify.getSong(
            updated.SPAuth.accessToken,
            "4PTG3Z6ehGkBFwjybzWkR8"
        );

        let album = await spotify.getAlbum(
            updated.SPAuth.accessToken,
            "6eUW0wxWtzkFdaEFsTJto6"
        );

        return res.json(album);

        // await userData.addAMAccessData(
        //     inserted._id,
        //     "abc"
        // ); // testing am
        // let updatedAM = await userData.getUser(inserted._id);
        // let playlistsAM = appleMusic.getLibraryPlaylistsForPreview(
        //     updatedAM.AMAuth.musicUserToken
        // );

        // return res.json({
        //     usr: updatedAM,
        //     playlists: playlistsAM
        // });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export default router;
