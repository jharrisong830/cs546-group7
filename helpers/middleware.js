import express from "express";

import session from "express-session";
import authRoutes from "../routes/index.js";

const rootReroute = (req, res, next) => {
    //for root url
    if (req.session.user) {
        return res.render("feed", {});
    }
};

const loginSignupReroute = (req, res, next) => {
    // use for login + signup pages
    if (req.session.user) {
        res.redirect("/");
    }
};

export { rootReroute, loginSignupReroute };
