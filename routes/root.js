import { Router } from "express";

const router = Router();

router.route("/").get((req, res) => {
    return res.render("index", { title: "Home" });
});

export default router;
