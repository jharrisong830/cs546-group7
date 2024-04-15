/**
 * methods to interact with data from the "posts" collection
 */

import { users, posts } from "../config/mongoCollections.js";
import { userData } from "../data/index.js";
import vld from "../helpers/validation.js";
import errorMessage from "../helpers/error.js";

const MOD_NAME = "data/posts.js";

/**
 * creates a new post, adds it to the post database, and associates it with the author's database entry
 *
 * @param {string | ObjectId} authorId  the user creating this post
 * @param {Object} musicContent         music content of the post (a music item object returned from our api functions in ./api)
 * @param {string} textContent          text content of the post
 *
 * @returns {Object} the registered post object, as it was inserted into the database collection
 * @throws on invalid input or if there is an error adding/updating the object to the database collection
 */
const createPost = async (
    authorId,
    musicContent, // assume validated since this is coming from our own functions that interface with the apis
    textContent
) => {
    authorId = vld.checkObjectId(authorId);

    textContent = vld.returnValidString(textContent);
    vld.checkEmptyString(textContent);

    let newPost = {
        authorId: authorId,
        musicContent: musicContent,
        textContent: textContent,
        likes: [],
        comments: [],
        createTime: Math.floor(Date.now() / 1000) // get unix epoch seconds
    };

    const userCol = await users();
    const postCol = await posts();

    const insertInfo = await postCol.insertOne(newPost);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        errorMessage(
            MOD_NAME,
            "createPost",
            `failed to add new post by '${newPost.authorId}'`
        );
    }

    const userUpdateInfo = await userCol.updateOne(
        { _id: authorId },
        {
            $push: { posts: insertInfo.insertedId }
        }
    );
    if (
        !userUpdateInfo ||
        userUpdateInfo.matchedCount === 0 ||
        userUpdateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "createPost",
            `Unable to modify database entry for ${authorId}. This object might not exist`
        );
    }

    return await postCol.findOne({ _id: insertInfo.insertedId }); // return the object just added to the db
};

const exportedMethods = {};

export default exportedMethods;
