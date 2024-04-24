/**
 * express route handling
 */

import authRoutes from "./auth.js";
import debugRoutes from "./debug.js";
import signupRoutes from "./signup.js";
import profileRoutes from "./profile.js";
import settingsRoutes from "./changeProfile.js";

const constructorMethod = (app) => {
    app.use("/auth", authRoutes);
    app.use("/debug", debugRoutes);
    app.use("/signup", signupRoutes);
    app.use("/user", profileRoutes);
    app.use("/settings", settingsRoutes);

    app.use("/", (req, res) => {
        return res.render("index", { title: "Home" });
    });

    app.use("*", (req, res) => {
        return res
            .status(404)
            .render("error", { title: "Error", error: "404: Route not found" }); // ignore all other endpoints
    });
};

export default constructorMethod;
