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

    const currTime = Math.floor(Date.now() / 1000); // get unix epoch seconds

    let newPost = {
        authorId: authorId,
        musicContent: musicContent,
        textContent: textContent,
        likes: [],
        comments: [],
        createTime: currTime,
        lastUpdated: currTime
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

/**
 * fetch a post object from the database
 * @param {string | ObjectId} id    unique post id
 *
 * @returns {Object} the full post object
 * @throws if id is invalid or such a post does not exist
 */
const getPost = async (id) => {
    id = vld.checkObjectId(id);

    const postCol = await posts();
    const post = await postCol.findOne({ _id: id });

    if (!post)
        errorMessage(MOD_NAME, "getPost", `No post with '${id}' was found`);
    return post;
};

/**
 * get all of the posts authored by a specific user, returned in reverse-chronological order
 *
 * @param {string | ObjectId} id    id of user for which to get the posts
 */
const getUserPosts = async (id) => {
    id = vld.checkObjectId(id);

    const postCol = await posts();
    const userPosts = await postCol
        .find({ authorId: id })
        .sort({ createTime: -1 }); // sort in descending order
    // TODO
};

/**
 * updates the text content of a post, and changes the last updated field
 *
 * @param {string | ObjectID} id    id of user to be updated
 * @param {string} newText          the new text content of the post
 *
 * @returns {Object} newly updated post object
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const updatePost = async (id, newText) => {
    id = vld.checkObjectId(id);

    newText = vld.returnValidString(newText);
    vld.checkEmptyString(newText);

    const postCol = await posts();
    const updateInfo = await postCol.updateOne(
        { _id: id },
        {
            $set: {
                textContent: newText,
                lastUpdated: Math.floor(Date.now() / 1000)
            }
        }
    );

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "updatePost",
            `Unable to modify database entry for ${id}. This object might not exist`
        );
    }

    return await getPost(id);
};

/**
 * deletes a post from the database, and removes it from it's associated author
 *
 * @param {string | ObjectId} id    id of post to be deleted
 *
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const deletePost = async (id) => {
    id = vld.checkObjectId(id);

    const post = await getPost(id);
    if (!post)
        errorMessage(MOD_NAME, "deletePost", `No post with '${id}' was found`);

    const userCol = await users();
    const postCol = await posts();

    const userUpdateInfo = await userCol.updateOne(
        { _id: post.authorId },
        { $pull: { posts: id } }
    ); // removes the post from the user's array

    if (
        !userUpdateInfo ||
        userUpdateInfo.matchedCount === 0 ||
        userUpdateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "deletePost",
            `Unable to modify database entry for ${id}. This object might not exist`
        );
    }

    const deleteInfo = await postCol.deleteOne({ _id: id });

    if (
        !deleteInfo ||
        !deleteInfo.acknowledged ||
        deleteInfo.deletedCount !== 1
    ) {
        errorMessage(MOD_NAME, "deletePost", `Unable to delete ${id}`);
    }
};

/**
 * generate a feed of posts for the given user based on their friends list
 *
 * @param {string | ObjectId} id    id of user for which the feed will be generated
 *
 * @returns {[Object]} list of post objects in reverse chronological order, to populate the feed
 * @throws @throws on invalid input or if there are errors in getting database entries
 */
const generateFeed = async (id) => {};

const exportedMethods = {
    createPost,
    getPost,
    updatePost,
    deletePost
};

export default exportedMethods;
