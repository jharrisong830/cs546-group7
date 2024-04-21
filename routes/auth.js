/**
 * routes for authorizing external services (spotify, AM...)
 *
 * implements authorization PKCE code flow to gain access to spotify api
 * see more details here: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */

import { Router } from "express";
import { config } from "dotenv";
import axios from "axios";
import authentication from "../helpers/authentication.js";

config(); // load environment vars from .env file

const router = Router();

const codes = await authentication.getPKCECodes(64);

router.route("/").get((req, res) => {
    return res.render("auth", { title: "Authorize" });
});

router.route("/spotify").get((req, res) => {
    const authURL = authentication.SPGetAuthorizationURL(
        codes["codeChallenge"]
    );

    return res.redirect(authURL);
});

router.route("/spotify/success").get(async (req, res) => {
    let authCode = req.query.code || null;
    if (authCode === null) {
        return res
            .status(500)
            .render("error", {
                title: "Error",
                errmsg: "500: issue getting spotify user auth code"
            });
    }

    const accessBody = {
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: process.env.SPOTIFY_REDIRECT,
        client_id: process.env.SPOTIFY_CLIENT, // for PKCE
        code_verifier: codes["codeVerifier"]
    };
    const accessHeader = {
        "Content-Type": "application/x-www-form-urlencoded"
    };

    try {
        const { data } = await axios.post(
            "https://accounts.spotify.com/api/token",
            accessBody,
            {
                headers: accessHeader
            }
        ); // post request, with given body/header data

        const { access_token, expires_in, refresh_token } = data; // extract important info, so we can insert in the db later

        return res.json({ authData: data, status: "success" }); // TODO: don't actually display this to user, handle and associate access token with user profile to use for api requests
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.route("/apple-music").get((req, res) => {
    const devToken = authentication.AMGenerateDevToken();
    return res.render("auth/apple-music", {
        title: "am test",
        AMDevToken: devToken
    });
});

router.route("/apple-music/success").get(async (req, res) => {
    let mut = req.query.mut || null; // try to get music user token from query params
    if (mut === null) {
        return res
            .status(500)
            .render("error", {
                title: "Error",
                errmsg: "500: issue getting apple music user token"
            });
    }

    return res.json({ authData: req.query.mut, status: "success" }); // TODO: don't actually display this to user, handle and associate access token with user profile to use for api requests
});

export default router;
