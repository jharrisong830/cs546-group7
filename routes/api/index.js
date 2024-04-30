import { Router } from "express";
import postAPI from "./posts.js";
import musicAPI from "./musicContent.js";
import commentAPI from "./comments.js";

const router = Router();

router.use("/posts", postAPI);
router.use("/music", musicAPI);
router.use("/comments", commentAPI);

export default router;
