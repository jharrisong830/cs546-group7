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
router
    .route("/:username/messages")
    .get(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).render("error", {
            title: "Error",
            errmsg: "401: You need to be logged in to access this page."
        });
    }
    try {
        // const messages = await userData.getMessages(req.session.user._id);
        return res.render("messaging", {
            title: "Messages",
            // messaging: messaging
        });
    } catch (e) {
        return res.status(404).render("error", { title: "Error", errmsg: e });
    }
});
router
    .route("/:username/edit")
    .get(async (req, res) => {
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
                return res.status(403).render("error", {
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
            return res
                .status(404)
                .render("error", { title: "Error", errmsg: e });
        }
    })
    .post(async (req, res) => {
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
                return res.status(403).render("error", {
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

            let usr = await userData.getUser(userId);

            let updatedFields = req.body;

            if (
                updatedFields.publicProfile !== "public" &&
                updatedFields.publicProfile !== "private"
            ) {
                errorMessage(
                    MOD_NAME,
                    `/user/${req.session.user.username}/edit POST`,
                    "invalid option for public profile"
                );
            }
            if (
                (updatedFields.publicProfile === "public") !==
                usr.publicProfile
            ) {
                usr = await userData.toggleProfileVisibility(usr._id); // toggle the profile visibility, if needed
            }
            delete updatedFields.publicProfile;

            Object.keys(updatedFields).forEach((field) => {
                if (updatedFields[field].trim().length === 0)
                    delete updatedFields[field]; // delete a field if it was left blank
                if (field === "confirmPassword") delete updatedFields[field]; // delete confirm password field (not needed)
            });

            if (Object.keys(updatedFields).length !== 0) {
                usr = await userData.updateUser(usr._id, updatedFields); // pass along the remaining updated fields to be validated/set
            }

            req.session.user = {
                // re-set fields of the current user (username or profile status might have changed)
                _id: usr._id,
                username: usr.username,
                publicProfile: usr.publicProfile,
                name: usr.name
            };

            return res.redirect(`/user/${req.session.user.username}`); // redirect to the user's profile
        } catch (e) {
            return res.render("userEdit", {
                title: "Edit User Profile",
                hasName: req.session.user.name !== null,
                user: req.session.user,
                errmsg: e
            });
        }
    });

export default router;
