
import {Router} from 'express';
const router = Router();
import xss from 'xss';
import { postData } from "../data/index.js";

router
    .route('/api/post/json')
    .get(async (req, res) => {
        const feedPosts = await postData.generateFeed(req.session.user._id); 
        res.json(feedPosts);
    })
    .post(async (req, res) => {
        let cleanPost = xss(req.body.post);
        //upload post to DB
        console.log(cleanPost);
        res.json({success: true, post:cleanPost, user: req.session.user.username});
    })

export default router;