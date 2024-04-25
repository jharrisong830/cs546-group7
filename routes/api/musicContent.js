import { Router } from "express";
import { userData, SPData } from "../../data/index.js";
import authentication from "../../helpers/authentication.js";

const router = Router();

router.route("/spotify/playlists").get(async (req, res) => {
    if (!req.session.user) {
        return res
            .status(401)
            .json({
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
        return res.status(500).json({ success: false, errmsg: e });
    }
});

export default router;
