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
        // console.log("Ratings request body" + newRating);

        let starRating = parseInt(newRating.ratingNumber);

        let addedRating = await postData.ratePlaylist(
            newRating.idUrl,
            req.session.user._id,
            starRating,
            newRating.textContent
        );

        if (typeof(addedRating) === "string"){
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
        const liked = await postData.likeRating(req.body.idUrl, userID);
        return res.json({ success: true, liked: liked });
    } catch (e) {
        return res.status(500).json({ success: false, errmsg: e.message });
    }
});

export default router;
