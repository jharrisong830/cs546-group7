import { Router } from "express";
import { userData } from "../data/index.js";
import vld from "../helpers/validation.js";

const router = Router();

router.route("/:username").get(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).render("error", {
            title: "Error",
            errmsg: "401: You need to be logged in to access this page."
        });
    }
    try {
        req.params.username = vld
            .returnValidString(req.params.username)
            .toLowerCase(); // get the username as lowercase
        const isCurrent = req.session.user.username === req.params.username; // we are viewing the current user's page if the usernames match

        const userId = await userData.findByUsername(req.params.username); // get the id of the requested user

        if (!userId) {
            return res.status(404).render("error", {
                title: "Error",
                errmsg: `404: user '${req.params.username}' was not found`
            });
        }

        const usr = await userData.getUser(userId);

        return res.render("user", {
            title: usr.username,
            hasName: usr.name !== null,
            isCurrent: isCurrent,
            showProfile: usr.publicProfile || isCurrent, // we will show content if profile is public or if this is the current user (false when private and not current user)
            user: usr
        });
    } catch (e) {
        return res.status(404).render("error", { title: "Error", errmsg: e });
    }
});

router.route("/:username/edit").get(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).render("error", {
            title: "Error",
            errmsg: "401: You need to be logged in to access this page."
        });
    }

    try {
        req.params.username = vld
            .returnValidString(req.params.username)
            .toLowerCase(); // get the username as lowercase
        const isCurrent = req.session.user.username === req.params.username; // we are viewing the current user's page if the usernames match

        if (!isCurrent)
            return res
                .status(403)
                .render("error", {
                    title: "Error",
                    errmsg: "403: You are not allowed to access this page."
                }); // render error if a user tries to edit another user's page

        const userId = await userData.findByUsername(req.params.username); // get the id of the requested user

        if (!userId) {
            return res.status(404).render("error", {
                title: "Error",
                errmsg: `404: user '${req.params.username}' was not found`
            });
        }

        const usr = await userData.getUser(userId);

        return res.render("userEdit", {
            title: "Edit User Profile",
            hasName: usr.name !== null,
            user: usr
        });
    } catch (e) {
        return res.status(404).render("error", { title: "Error", errmsg: e });
    }
});

export default router;
