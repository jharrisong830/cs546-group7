import { Router } from "express";
import { postData, userData } from "../data/index.js";

const router = Router();

router.route("/:postId").get(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).render("error", {
            title: "Error",
            errmsg: "401: You need to be logged in to access this page."
        });
    }

    try {
        const post = await postData.getPost(req.params.postId);
        //console.log(post);
        let author = post.authorUsername,
            text = post.textContent,
            music = post.musicContent,
            likes = post.likes,
            comments = post.comments,
            updated = post.lastUpdated,
            tags = post.tags;
        updated = new Date(updated * 1000).toISOString().split("T")[0];
        const edited = post.lastUpdated !== post.createTime;
        for (let i = 0; i < comments.length; i++) {
            comments[i].createTime = new Date(comments[i].createTime * 1000)
                .toISOString()
                .split("T")[0];
        }

        if (post.musicContent && post.musicContent.ratings) {
            for (let i = 0; i < post.musicContent.ratings.length; i++) {
                post.musicContent.ratings[i].createTime = new Date(
                    post.musicContent.ratings[i].createTime * 1000
                )
                    .toISOString()
                    .split("T")[0];
            }
        }
        console.log("this post's type is " + music.type);

        let isPlaylist = music.type === "playlist" ? true : false;

        res.render("post", {
            title: `Post by @${author}`,
            author: author,
            text: text,
            updated: updated,
            likes: likes,
            edited: edited,
            _id: req.params.postId,
            comments: comments,
            musicType: music.type,
            musicURL: music._id,
            tags: tags,
            isPlaylist: isPlaylist,
            ratings: post.musicContent.ratings
        });
        //id:req.params.postId, userId: req.session.user._id});
        //res.render('post', {author: author, text:text, music:music, likes:likes,
        //    comments:comments, updated: updated, edited:edited});
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

export default router;
