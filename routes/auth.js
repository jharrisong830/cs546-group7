/**
 * routes for authorizing external services (spotify, AM...)
 */

import { Router } from "express";
import { config } from "dotenv";

config(); // load environment vars from .env file


const router = Router();

router
    .route("/spotify")
    .get((req, res) => {
        const scope = "playlist-read-private user-read-private user-library-read"; // TODO: refine scopes to be minimal
        const userAuthQuery = {
            response_type: "code",
            redirect_uri: process.env.SPOTIFY_REDIRECT,
            client_id: process.env.SPOTIFY_CLIENT,
            scope: scope
        };

        const authURL = "https://accounts.spotify.com/authorize?" + // construct http query
            Object.keys(userAuthQuery).map((currKey) => `${currKey}=${userAuthQuery[currKey]}`).join("&");

        res.redirect(authURL); 
    });

router
    .route("/spotify/success")
    .get((req, res) => {
        let authCode = req.query.code || null;
        if (authCode === null) {
            return res.status(500).json({error: "issue getting spotify user auth code"})
        }
        return res.json({authCode: authCode, status: "success"});
    });


export default router;