/**
 * express route handling
 */

import authRoutes from "./auth.js";
import debugRoutes from "./debug.js";

const constructorMethod = (app) => {
    app.use("/auth", authRoutes);
    app.use("/debug", debugRoutes);

    app.use("/", (req, res) => {
        return res.render("index", { title: "Home" });
    });

    app.use("*", (req, res) => {
        return res.status(404).json({ error: "Route not found" }); // ignore all other endpoints
    });
};

export default constructorMethod;
