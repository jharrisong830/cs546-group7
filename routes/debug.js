/**
 * debug routes
 */

import { Router } from "express";
import { userData } from "../data/index.js";
import spotify from "../data/api/spotify.js";

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
        await userData.addSPAccessData(inserted._id, "abc", 42069, "edf"); // test inserting SPAuth subdoc
        let updated = await userData.getUser(inserted._id);
        let SPid = await spotify.getUserId(updated.SPAuth.accessToken);
        let playlists = await spotify.getPrivatePlaylistsForPreview(
            updated.SPAuth.accessToken
        );
        return res.json({ SP_ID: SPid, usr: updated, playlists: playlists });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export default router;
