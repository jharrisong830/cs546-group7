import { Router } from "express";
import xss from "xss";
import { postData, SPData, userData } from "../../data/index.js";
import authentication from "../../helpers/authentication.js";

const router = Router();

router.route("/").post(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            errmsg: "You must be logged in to access this data."
        });
    }

    try {
        let newPost = req.body;

        let musicItem = {};

        if (newPost.musicContentType === "playlist") {
            const usr = await authentication.SPRequestRefresh(
                req.session.user._id
            );
            musicItem = await SPData.getPlaylist(
                usr.SPAuth.accessToken,
                newPost.musicContentId
            );
        } else if (newPost.musicContentType === "song") {
            const usr = await authentication.SPRequestRefresh(
                req.session.user._id
            );
            musicItem = await SPData.getSong(
                usr.SPAuth.accessToken,
                newPost.musicContentId
            );
        } else if (newPost.musicContentType === "album") {
            const usr = await authentication.SPRequestRefresh(
                req.session.user._id
            );
            musicItem = await SPData.getAlbum(
                usr.SPAuth.accessToken,
                newPost.musicContentId
            );
        } else {
            return res.status(400).json({
                success: false,
                errmsg: "Unexpected music content type."
            });
        }

        let addedPost = await postData.createPost(
            req.session.user._id,
            musicItem,
            newPost.textContent
        );

        return res.json({ success: true, addedPost: addedPost }); // redirect to the user's profile
    } catch (e) {
        return res.status(500).json({ success: false, errmsg: e });
    }
});

router.route("/feed").get(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            errmsg: "You must be logged in to access this data."
        });
    }
    try {
        const feedPosts = await postData.generateFeed(req.session.user._id);
        return res.json({ success: true, feedPosts: feedPosts });
    } catch (e) {
        return res.status(500).json({ success: false, errmsg: e });
    }
});

export default router;