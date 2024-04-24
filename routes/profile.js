import { Router } from "express";
import { userData } from "../data/index.js";
import vld from "../helpers/validation.js";
import errorMessage from "../helpers/error.js";

const router = Router();

router.route("/").get(async (req, res) => {
    return res.json({ error: "YOU SHOULD NOT BE HERE!" });
});

router.route("/:username").get(async (req, res) => {
    try {
        const current = false;
        if (
            req.session.user.toLowerCase() == req.params.username.toLowerCase()
        ) {
            // FIX???
            current = true;
        }
        const user = await userData.getUser(req.params.username);
        res.render("profile", {
            displayName: user.name,
            userName: user.username,
            birthday: user.dateOfBirth,
            current: current,
            public: user.publicProfile,
            posts: user.posts,
            comments: user.comments
        });
    } catch (e) {
        return res.status(400).json({ error: e });
    }
});

export default router;
