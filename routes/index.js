/**
 * express route handling
 */

import authRoutes from "./auth.js";
import debugRoutes from "./debug.js";
import signupRoutes from "./signup.js";
import loginRoutes from "./login.js";
import rootRoute from "./root.js";
import userRoutes from "./user.js";
import api from "./api/index.js";
import searchRoutes from "./search.js";
import postRoutes from "./post.js";

const constructorMethod = (app) => {
    app.use("/auth", authRoutes);
    app.use("/debug", debugRoutes);
    app.use("/signup", signupRoutes);
    app.use("/login", loginRoutes);
    app.use("/user", userRoutes);
    app.use("/post", postRoutes);

    app.use("/api", api);
    app.use("/search", searchRoutes);

    app.use("/", rootRoute); // root renders the homepage (needed to separate into router to prevent undefined routes from working)

    app.use("*", (req, res) => {
        return res.status(404).render("error", {
            title: "Error",
            errmsg: `404: Route '${req.originalUrl}' not found`
        }); // ignore all other endpoints
    });
};

export default constructorMethod;
