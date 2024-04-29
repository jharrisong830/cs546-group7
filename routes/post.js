import { Router } from "express";
import { postData } from "../data/index.js";

const router = Router();

router.route("/:postId").get(async (req, res) => {
    // TODO
    return res.status(500).json({ error: "TODO" });
});

export default router;
