/**
 * routes for registering new users
 */

import { Router } from "express";
import { userData } from "../data/index.js";
import vld from "../helpers/validation.js";

const router = Router();

router
    .route("/")
    .get(async (req, res) => {
        // const SAMPLE_DATA = {
        //     username: "jgraham5",
        //     email: "jgraham5@stevens.edu",
        //     password: "1234",
        //     dateOfBirth: "08/30/2003"
        // };

        /*try {
        let inserted = await userData.registerUser(
            SAMPLE_DATA.username,
            SAMPLE_DATA.email,
            SAMPLE_DATA.password,
            SAMPLE_DATA.dateOfBirth
        );
        return res.json({ status: "success", user: inserted }); */

        res.render("signup", { title: "Sign Up" });
    })
    .post(async (req, res) => {
        const newData = req.body;
        try {
            const newUser = validateUserParams(
                newData.userName,
                newData.userPassword,
                newData.dateOfBirth,
                newData.privacy,
                newData.displayName
            );

            const added = await userData.registerUser(
                newUser.username,
                newUser.password,
                newUser.dateOfBirth,
                newUser.publicProfile,
                newUser.name
            );
        } catch (e) {
            return res.status(500).json({ error: e });
        }
    });

export default router;
