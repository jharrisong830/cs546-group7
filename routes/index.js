/**
 * express route handling
 */

import authRoutes from "./auth.js";
import debugRoutes from "./debug.js";
import signupRoutes from "./signup.js";
import loginRoutes from "./login.js";
import searchRoutes from "./search.js";

const constructorMethod = (app) => {
    app.use("/auth", authRoutes);
    app.use("/debug", debugRoutes);
    app.use("/signup", signupRoutes);
    app.use("/login", loginRoutes);
    app.use("/search", searchRoutes);

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
