/**
 * Main file
 * 'npm start' to start running the web server
 */

import express from "express";
import { config } from "dotenv";

config(); // load environment vars from .env file

const app = express();
app.use(express.json()); // json middleware

app.get("/login", (req, res) => {
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

app.get("/callback", (req, res) => {
    let authCode = req.query.code || null;
    console.log("We got a code!");
    console.log(authCode);
});





app.listen(3000, () => {
    console.log("Web server now running at http://localhost:3000");
});
