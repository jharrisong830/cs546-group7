import { Router } from "express";
import { userData } from "../data/index.js";
import vld from "../helpers/validation.js";
import errorMessage from "../helpers/error.js";
import xss from "xss";

const router = Router();

const MOD_NAME = "routes/login.js";

router
    .route("/")
    .get(async (req, res) => {
        res.render("login", { title: "Log In" });
    })
    .post(async (req, res) => {
        const loginData = req.body;
        try {
            loginData.username = xss(loginData.username);
            loginData.username = vld.returnValidString(loginData.username);
            loginData.username = loginData.username.toLowerCase();
            vld.checkEmptyString(loginData.username);

            loginData.password = xss(loginData.password);
            loginData.password = vld.returnValidString(loginData.password);
            vld.checkEmptyString(loginData.password);

            const loginUserId = await userData.findByUsername(
                loginData.username
            );
            if (loginUserId === null) {
                errorMessage(
                    MOD_NAME,
                    "/login POST",
                    "Invalid login credentials"
                );
            }

            const correctPassword = await userData.comparePassword(
                loginUserId,
                loginData.password
            );

            if (!correctPassword) {
                errorMessage(
                    MOD_NAME,
                    "/login POST",
                    "Invalid login credentials"
                );
            }

            // past this point, the user has authenticated themselves with the correct username/password, time to sign them in!

            const usr = await userData.getUser(loginUserId);

            req.session.user = {
                _id: loginUserId,
                username: usr.username,
                publicProfile: usr.publicProfile,
                name: usr.name
            };

            return res.redirect("/");
        } catch (e) {
            return res
                .status(400)
                .render("login", { title: "Log In", errmsg: e });
        }
    });

export default router;
