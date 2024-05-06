import { Router } from "express";
import xss from "xss";
import { postData, userData } from "../../data/index.js";

const router = Router();

router.route("/").post(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            errmsg: "You must be logged in to access this data."
        });
    }

    try {
        let newComment = req.body;
        let cleanUrl = xss(newComment.idUrl),
            cleanText = xss(newComment.textContent);
        let addedComment = await postData.commentPost(
            cleanUrl,
            req.session.user._id,
            cleanText
        );

        return res.json({ success: true, addedComment: addedComment }); // redirect to the user's profile
    } catch (e) {
        return res.status(500).json({ success: false, errmsg: e });
    }
});

router.route("/like").post(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            errmsg: "You must be logged in to access this data."
        });
    }
    // console.log(req.body);
    try {
        const userID = req.session.user._id;
        const liked = await postData.likeComment(req.body.idUrl, userID);
        return res.json({ success: true, liked: liked });
    } catch (e) {
        return res.status(500).json({ success: false, errmsg: e });
    }
});

export default router;
