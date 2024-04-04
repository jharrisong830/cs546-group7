/**
 * routes for registering new users
 */

import { Router } from "express";
import { userData } from "../data/index.js";

const router = Router();

router.route("/").get(async (req, res) => {
    const SAMPLE_DATA = {
        username: "jgraham5",
        email: "jgraham5@stevens.edu",
        password: "1234",
        dateOfBirth: "08/30/2003"
    };

    try {
        let inserted = await userData.registerUser(
            SAMPLE_DATA.username,
            SAMPLE_DATA.email,
            SAMPLE_DATA.password,
            SAMPLE_DATA.dateOfBirth
        );
        return res.json({ status: "success", user: inserted });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export default router;
