/**
 * routes for authorizing external services (spotify, AM...)
 * 
 * implements authorization code flow to gain access to spotify api
 * see more details here: https://developer.spotify.com/documentation/web-api/tutorials/code-flow 
 */

import { Router } from "express";
import { config } from "dotenv";
import axios from "axios";
import authentication from "../public/js/authentication.js";

config(); // load environment vars from .env file


const router = Router();

router
    .route("/spotify")
    .get((req, res) => {
        const authURL = authentication.getSpotifyAuthorizationURL();

        return res.redirect(authURL); 
    });

router
    .route("/spotify/success")
    .get(async (req, res) => {
        let authCode = req.query.code || null;
        if (authCode === null) {
            return res.status(500).json({error: "issue getting spotify user auth code"})
        }

        const accessBody = {
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: process.env.SPOTIFY_REDIRECT
        };
        const accessHeader = {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + (new Buffer.from(process.env.SPOTIFY_CLIENT + ":" + process.env.SPOTIFY_SECRET).toString("base64")) // send api client/secret as encoded string in the header
        };

        try {
            const {data} = await axios.post("https://accounts.spotify.com/api/token", accessBody, {
                headers: accessHeader
            }); // post request, with given body/header data
            return res.json({authData: data, status: "success"}); // TODO: don't actually display this to user, handle and associate access token with user profile to use for api requests
        } catch (e) {
            return res.status(500).json({error: e});
        }
    });


export default router;