import { Router } from "express";
import postAPI from "./posts.js";
import musicAPI from "./musicContent.js";
import commentAPI from "./comments.js";
import ratingAPI from "./ratings.js";

const router = Router();

router.use("/posts", postAPI);
router.use("/music", musicAPI);
router.use("/comments", commentAPI);
router.use("/ratings", ratingAPI);

export default router;
