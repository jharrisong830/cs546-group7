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

        let addedComment = await postData.commentPost(
            newComment.idUrl,
            req.session.user._id,
            newComment.textContent
        );

        return res.json({ success: true, addedComment: addedComment }); // redirect to the user's profile
    } catch (e) {
        return res.status(500).json({ success: false, errmsg: e });
    }
});

export default router;
