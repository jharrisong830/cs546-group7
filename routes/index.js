/**
 * express route handling
 */

import authRoutes from "./auth.js";
import signupRoutes from "./signup.js";

const constructorMethod = (app) => {
    app.use("/auth", authRoutes);
    app.use("/signup", signupRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Route not found" }); // ignore all other endpoints
    });
};

export default constructorMethod;
