/**
 * middleware functions
 */

const MOD_NAME = "helpers/middleware.js";

/**
 * middleware to log timestamps for requests made to our server
 *
 * @route `/`
 */
const logMessages = (req, res, next) => {
    console.log(
        `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${!req.session.user ? "Non-Authenticated" : "Authenticated"} User)`
    );
    next();
};

/**
 * middleware to render feed page as route if a user is logged in
 *
 * @route `/`
 */
const feedRender = (req, res, next) => {
    if (req.originalUrl === "/") {
        // make sure we onlt render if we're on the `/` route
        if (req.session.user) {
            return res.render("feed", {});
        }
    }
    next();
};

/**
 * middleware to direct the user away from the login/signup routes if they are already logged in
 *
 * @route `/login`
 * @route `/signup`
 */
const loginSignupReroute = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    next();
};

/**
 * middleware to handle the `/logout` route
 * if a user is logged it, it will log them out and return them to `/login`
 * if a user is not logged in, nothing will happen, and they will be redirected to `/login`
 *
 * @route `/logout`
 */
const logoutReroute = (req, res, next) => {
    if (req.session.user) {
        req.session.destroy(); // destroy the session, if one exists
    }
    return res.redirect("/login"); // go to login route, regardless of if user was logged in or not
};

const exportedMethods = {
    logMessages,
    feedRender,
    loginSignupReroute,
    logoutReroute
};

export default exportedMethods;
