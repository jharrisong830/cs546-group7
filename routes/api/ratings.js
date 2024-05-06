import { Router } from "express";
import xss from "xss";
import { postData, userData } from "../../data/index.js";

const router = Router();

router.route("/").post(async (req, res) => {
    console.log("post ratings reached!"); // working
    console.log(req.body);

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            errmsg: "You must be logged in to access this data."
        });
    }

    try {
        let newRating = req.body;
        let cleanText = xss(newRating.textContent);
        let cleanRating = xss(newRating.ratingNumber);
        let cleanUrl = newRating.idUrl;
        let starRating = parseInt(cleanRating);

        let addedRating = await postData.ratePlaylist(
            cleanUrl,
            req.session.user._id,
            starRating,
            cleanText
        );

        if (typeof addedRating === "string") {
            return res.json({ success: false, message: addedRating });
        }

        return res.json({ success: true, addedRating: addedRating });
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
    try {
        const userID = req.session.user._id;
        let cleanUrl = xss(req.body.idUrl);
        const liked = await postData.likeRating(cleanUrl, userID);
        return res.json({ success: true, liked: liked });
    } catch (e) {
        return res.status(500).json({ success: false, errmsg: e.message });
    }
});

export default router;
