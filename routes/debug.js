/**
 * debug routes
 */

import { Router } from "express";
import { userData } from "../data/index.js";
import spotify from "../data/api/spotify.js";
import appleMusic from "../data/api/appleMusic.js";

const router = Router();

router.route("/").get(async (req, res) => {
    // await userData.addAMAccessData(
    //     inserted._id,
    //     "abc"
    // ); // testing am
    try {
        let usr = await userData.getUser(req.session.user._id);
        let playlistsAM = appleMusic.getLibraryPlaylistsForPreview(
            usr.AMAuth.AMDevToken,
            usr.AMAuth.musicUserToken
        );

        return res.json({
            usr: usr,
            playlists: playlistsAM
        });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export default router;
