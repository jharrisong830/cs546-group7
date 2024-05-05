import { Router } from "express";
import { userData, SPData } from "../../data/index.js";
import authentication from "../../helpers/authentication.js";

const router = Router();

router.route("/spotify/playlists").get(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            errmsg: "You must be logged in to access this data."
        });
    }

    try {
        const usr = await authentication.SPRequestRefresh(req.session.user._id); // get the current user (will be updated if a refresh is needed)
        const playlists = await SPData.getPrivatePlaylistsForPreview(
            usr.SPAuth.accessToken
        );
        return res.json({ success: true, playlists: playlists }); // return json data as an array of playlist previews
    } catch (e) {
        if (
            e.startsWith(
                "ERROR in helpers/authentication.js / SPRequestRefresh"
            )
        ) {
            // send different data if error is due to account not being connected
            return res
                .status(500)
                .json({ success: false, errmsg: e, notConnected: true });
        }
        return res.status(500).json({ success: false, errmsg: e });
    }
});

router.route("/spotify/searchCatalog").get(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            errmsg: "You must be logged in to access this data."
        });
    }

    const searchText = req.query.q || null;
    if (searchText === null) {
        return res.status(400).json({
            success: false,
            errmsg: "No/incorrect query string provided."
        });
    }

    try {
        const usr = await authentication.SPRequestRefresh(req.session.user._id); // get the current user (will be updated if a refresh is needed)
        const results = await SPData.searchCatalog(
            usr.SPAuth.accessToken,
            searchText
        );
        return res.json({ success: true, results: results }); // return json data as an array of catalog items (songs and albums)
    } catch (e) {
        if (
            e.startsWith(
                "ERROR in helpers/authentication.js / SPRequestRefresh"
            )
        ) {
            // send different data if error is due to account not being connected
            return res.status(500).json({
                success: false,
                errmsg: e,
                notConnected: true,
                username: req.session.user.username
            });
        }
        return res.status(500).json({ success: false, errmsg: e });
    }
});

router.route("/spotify/artwork").get(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            errmsg: "You must be logged in to access this data."
        });
    }

    const albumId = req.query.album || null;
    if (albumId === null) {
        return res.status(400).json({
            success: false,
            errmsg: "No/incorrect query string provided."
        });
    }

    try {
        const usr = await authentication.SPRequestRefresh(req.session.user._id); // get the current user (will be updated if a refresh is needed)
        const result = await SPData.getArtwork(usr.SPAuth.accessToken, albumId);
        return res.json({ success: true, url: result }); // return json data as string of url
    } catch (e) {
        return res.status(500).json({ success: false, errmsg: e });
    }
});

router.route("/appleMusic/devToken").get((req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            errmsg: "You must be logged in to access this data."
        });
    }
    return res.json({
        success: true,
        AMDevToken: authentication.AMGenerateDevToken()
    }); // return the dev token
});

export default router;
