/**
 * Main file
 * 'npm start' to start running the web server
 */

import express from "express";

import configRoutes from "./routes/index.js";


const app = express();
app.use(express.json()); // json middleware

configRoutes(app);

app.listen(3000, () => {
    console.log("Web server now running at http://localhost:3000");
});
