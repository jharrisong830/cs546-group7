import express from "express";
import session from "express-session";
import configRoutes from "./routes/index.js";
import exphbs from "express-handlebars";
import mid from "./helpers/middleware.js";

const app = express();

app.use("/public", express.static("public"));
app.use(express.json()); // for http bodies
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        name: "AuthenticationState",
        secret: "some secret string!",
        resave: false,
        saveUninitialized: false
    })
);

app.engine(
    "handlebars",
    exphbs.engine({ defaultLayout: "main", partialsDir: ["views/partials/"] })
);
app.set("view engine", "handlebars");

app.use("/", mid.logMessages);
app.use("/", mid.feedRender);
app.use("/login", mid.loginSignupReroute);
app.use("/signup", mid.loginSignupReroute);
app.use("/logout", mid.logoutReroute);
app.use("/user", mid.userReroute);

configRoutes(app);

app.listen(3000, () => {
    console.log("Server running! http://localhost:3000");
});
