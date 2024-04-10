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
            "BQDB7JPw-4aWga-cvZy9p6E-PSMzfBNf6SCE99uJ-qrCbls0-jJCri0eB_IoxD-iizjX13wrkSUStanIiELA8KHA_jyYLwQVPcYVF9yoFdn2Eyp44cpYJbIlgEGtp14HNSGxZToB6COrelRmirBoGMuk2HQPlOibGMZUUGY1aTfR1g835PN5gT3JzPz5cv-s0QfRz_fsz6AHR7R1A0741EN_1LnX2N7UROV9IQbO",
            42069,
            "edf"
        ); // test inserting SPAuth subdoc
        let updated = await userData.getUser(inserted._id);
        // let SPid = await spotify.getUserId(updated.SPAuth.accessToken);
        // let playlists = await spotify.getPrivatePlaylistsForPreview(
        //     updated.SPAuth.accessToken
        // );
        // let firstPlaylistSongs = await spotify.getPlaylistTracks(
        //     updated.SPAuth.accessToken,
        //     playlists[0]._id
        // );

        await userData.addAMAccessData(
            inserted._id,
            "Al89Hd8D/hOFcrK7SAijfczbOgYA9X iT2xakqe6Q3y 3Vw1xEBoU0XZbozrl6lrfW7clE6/cKFyk2bbtNXQiFB3i gMxfGhogSvhnIDijONC7I/S25eRZQsSyJGudaL1MX0vDiZRpft4wsUWmt77chvQhwqOiUpDddgTEqZLcqUhvCud/XjLPMdjU hIAlQUU6O5BHxIimFFNG35Yo3UsIPvvE9y72WeYiM6TkdPvNS cyMfQ=="
        ); // testing am
        let updatedAM = await userData.getUser(inserted._id);
        let playlistsAM = appleMusic.getLibraryPlaylistsForPreview(
            updatedAM.AMAuth.musicUserToken
        );

        return res.json({
            usr: updatedAM,
            playlists: playlistsAM
        });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export default router;
