/**
 * express route handling
 */

import authRoutes from "./auth.js";

const constructorMethod = (app) => {
    app.use("/auth", authRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({error: "Route not found"}); // ignore all other endpoints
    });
};

export default constructorMethod;
