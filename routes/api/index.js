import { Router } from "express";
import postAPI from "./posts.js";
import musicAPI from "./musicContent.js";

const router = Router();

router.use("/posts", postAPI);
router.use("/music", musicAPI);

export default router;
