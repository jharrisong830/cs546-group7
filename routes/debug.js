/**
 * debug routes
 */

import { Router } from "express";
import { userData } from "../data/index.js";
import spotify from "../data/api/spotify.js";

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
        await userData.addSPAccessData(
            inserted._id,
            "BQC0z1pwv-0NgXOxG4BAb8oeE2szlwoeeUB5pS95-i13SDeyukGd1ViltckMsCaV3louFe2PKcKeCcWIxBDWpskZFCEHYrGZivhYFoAdUmLUtbUoA6HgV9E9XY6wtKfzflxRapvQh15bTrVY6C7YL0f4pgeAFgtbBUaHeRV3ge9HeMOjNFsZHphIYU0e7jj62qrMKZRLfVb4ZygwISfn71hUVY24fPAtrhR-Ga6v",
            42069,
            "AQD5YxIvP8feb8aIfc2TBmOJ9XKskI7-r7W4edsPSHDBqWkqPaODwCxnTARHXFQyrw3b3ycM6QTaCxz65s7yfOeS7WFoyjR-KD6izqA-rl4b2W1701qVuID2WAlM1uFThvY"
        ); // test inserting SPAuth subdoc
        let updated = await userData.getUser(inserted._id);
        let SPid = await spotify.getUserId(updated.SPAuth.accessToken);
        return res.json({ SP_ID: SPid, usr: updated });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export default router;
