/**
 * routes for registering new users
 */

import { Router } from "express";
import { userData } from "../data/index.js";
import vld from "../helpers/validation.js";
import errorMessage from "../helpers/error.js";
import xss from "xss";

const MOD_NAME = "routes/signup.js";

const router = Router();

router
    .route("/")
    .get(async (req, res) => {
        res.render("signup", { title: "Sign Up" });
    })
    .post(async (req, res) => {
        const newData = req.body;
        newData.publicProfile = xss(newData.publicProfile);
        newData.username = xss(newData.username);
        newData.password = xss(newData.password);
        newData.dateOfBirth = xss(newData.dateOfBirth);
        newData.name = xss(newData.name);
        try {
            if (
                newData.publicProfile !== "public" &&
                newData.publicProfile !== "private"
            ) {
                errorMessage(
                    MOD_NAME,
                    "/signup POST",
                    "invalid option for public profile"
                );
            }
            const newUser = await vld.validateUserParams(
                newData.username,
                newData.password,
                newData.dateOfBirth,
                newData.publicProfile === "public", // true if public, false otherwise
                newData.name
            );

            const added = await userData.registerUser(
                newUser.username,
                newUser.password,
                newUser.dateOfBirth,
                newUser.publicProfile,
                newUser.name
            );

            req.session.user = {
                _id: added._id,
                username: added.username,
                publicProfile: added.publicProfile,
                name: added.name
            };

            return res.redirect("/");
        } catch (e) {
            return res
                .status(400)
                .render("signup", { title: "Sign Up", errmsg: `400: ${e}` });
        }
    });

export default router;
