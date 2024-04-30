/**
 * methods to interact with data from the "posts" collection
 */

import { users, posts } from "../config/mongoCollections.js";
import { userData } from "../data/index.js";
import vld from "../helpers/validation.js";
import errorMessage from "../helpers/error.js";
import { ObjectId } from "mongodb";

const MOD_NAME = "data/posts.js";

/**
 * creates a new post, adds it to the post database, and associates it with the author's database entry
 *
 * @param {string | ObjectId} authorId  the user creating this post
 * @param {Object} musicContent         music content of the post (a music item object returned from our api functions in ./api)
 * @param {string} textContent          text content of the post
 * @param {string[]} tagArr             array of genre tags, each a string describing a genre; maximum of three tags allowed
 *
 * @returns {Object} the registered post object, as it was inserted into the database collection
 * @throws on invalid input or if there is an error adding/updating the object to the database collection
 */
const createPost = async (
    authorId,
    musicContent, // assume validated since this is coming from our own functions that interface with the apis
    textContent,
    tagArr // assume validated since its options are chosen from a dropdown menu
) => {
    authorId = vld.checkObjectId(authorId);

    const usr = await userData.getUser(authorId);

    textContent = vld.returnValidString(textContent);
    vld.checkEmptyString(textContent);

    const currTime = Math.floor(Date.now() / 1000); // get unix epoch seconds

    let newPost = {
        authorId: authorId,
        authorUsername: usr.username,
        musicContent: musicContent,
        textContent: textContent,
        likes: [],
        comments: [],
        createTime: currTime,
        lastUpdated: currTime,
        tags: tagArr
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
 *
 * @returns {[Object]} array of current user's post in reverse-chronological order of the lastUpdated time
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const getUserPosts = async (id) => {
    id = vld.checkObjectId(id);

    const postCol = await posts();
    const userPosts = await postCol
        .find({ authorId: id })
        .sort({ lastUpdated: -1 }) // sort in descending order
        .toArray();

    if (!userPosts)
        errorMessage(
            MOD_NAME,
            "getUserPosts",
            `Unable to get posts for user '${id}'`
        );

    return userPosts;
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
const generateFeed = async (id) => {
    id = vld.checkObjectId(id);

    const usr = await userData.getUser(id);

    const postCol = await posts();
    const feedPosts = await postCol
        .find({ authorId: { $in: usr.friends } }) // get all posts by this user's friends
        .sort({ lastUpdated: -1 }) // sort in descending order
        .toArray();

    if (!feedPosts)
        errorMessage(
            MOD_NAME,
            "generateFeed",
            `Unable to get feed posts for user '${id}'`
        );

    return feedPosts;
};

/**
 * Likes a post given a specific post id.
 * Takes in the user id and adds the id of the user who is liking the post to the Likes array.
 *
 * @param {string | ObjectId} id       the post id to like
 * @param {string | ObjectId} userId   the user id of the user liking the post
 *
 * @throws if the operation is unsuccessful
 */
const likePost = async (id, userId) => {
    id = vld.checkObjectId(id);
    userId = vld.checkObjectId(userId);

    const postCol = await posts();
    const updateInfo = await postCol.updateOne(
        { _id: id },
        { $push: { likes: userId } }
    );

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "likePost",
            `Unable to like this post. It might not exist.`
        );
    }

    const userCol = await users();
    const userUpdateInfo = await userCol.updateOne(
        { _id: userId },
        {
            $push: { postLikes: id }
        }
    );

    if (
        !userUpdateInfo ||
        userUpdateInfo.matchedCount === 0 ||
        userUpdateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "likePost",
            `Unable to like this post. It might not exist.`
        );
    }
};

/**
 * Creates a comment subdocument using the comment text and adds it to the post object.
 *
 * @param {string | ObjectId} id          the post id to comment on
 * @param {string | ObjectId} userId      the user id of the commenter
 * @param {string} commentText            the text content of the comment
 *
 * @returns {Object} the newly created comment subdocument
 * @throws if the operation is unsuccessful
 */
const commentPost = async (id, userId, commentText) => {
    id = vld.checkObjectId(id);
    userId = vld.checkObjectId(userId);
    commentText = vld.returnValidString(commentText);
    vld.checkEmptyString(commentText);

    const currTime = Math.floor(Date.now() / 1000); // get unix epoch seconds
    let commentId = new ObjectId();

    let comment = {
        _id: commentId,
        authorId: userId,
        parentId: id,
        textContent: commentText,
        likes: [],
        createTime: currTime
    };

    const postCol = await posts();
    const updateInfo = await postCol.updateOne(
        { _id: id },
        {
            $push: { comments: comment }
        }
    );

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "commentPost",
            `Unable to comment on this post. It might not exist.`
        );
    }

    const userCol = await users();
    const userUpdateInfo = await userCol.updateOne(
        { _id: userId },
        {
            $push: { comments: commentId }
        }
    );

    if (
        !userUpdateInfo ||
        userUpdateInfo.matchedCount === 0 ||
        userUpdateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "commentPost",
            `Unable to like this post. It might not exist.`
        );
    }
    return comment;
};

/**
 * Likes a comment belonging to a specific post id.
 * Takes in the user id and adds the id of the user who is liking the comment to the Likes array.
 *
 * @param {string | ObjectId} commentId   the comment id of the comment being liked
 * @param {string | ObjectId} userId      the user id of the user liking the comment
 *
 * @throws if the operation is unsuccessful
 */
const likeComment = async (commentId, userId) => {
    commentId = vld.checkObjectId(commentId);
    userId = vld.checkObjectId(userId);

    const postCol = await posts();
    const updateInfo = await postCol.updateOne(
        { "comments._id": commentId },
        {
            $push: { "comments.$.likes": userId }
        }
    );

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "likeComment",
            `Unable to like this comment. It might not exist.`
        );
    }

    const userCol = await users();
    const userUpdateInfo = await userCol.updateOne(
        { _id: userId },
        {
            $push: { commentLikes: commentId }
        }
    );

    if (
        !userUpdateInfo ||
        userUpdateInfo.matchedCount === 0 ||
        userUpdateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "likeComment",
            `Unable to like this comment. It might not exist.`
        );
    }
};

// implement the adding of ratings to playlists, will work similar to comments, with extra fields to add ratings (x/5)

/**
 * Rates a playlist within a post by adding a rating object to the musicContent.ratings array.
 *
 * @param {string | ObjectId} id      The ID of the post containing the playlist to rate.
 * @param {string | ObjectId} userId      The ID of the user who is rating the playlist.
 * @param {number} starRating             The star rating given to the playlist (scale of 1 to 5).
 * @param {string} reviewText            Optional text content explaining the rating.
 *
 * @throws {Error}                        Throws an error if the operation fails.
 */
const ratePlaylist = async (id, userId, starRating, reviewText) => {
    id = vld.checkObjectId(id);
    userId = vld.checkObjectId(userId);
    starRating = vld.checkUnsignedInt(starRating);

    reviewText = vld.returnValidString(reviewText);
    vld.checkEmptyString(reviewText);

    if (starRating < 1 || starRating > 5) {
        errorMessage(
            MOD_NAME,
            "ratePlaylist",
            `Invalid rating: Ratings must be an integer between 1 and 5.`
        );
    }

    const postCol = await posts();
    const currTime = Math.floor(Date.now() / 1000); // get unix epoch seconds
    let ratingId = new ObjectId();

    const rating = {
        _id: ratingId,
        authorId: userId,
        parentId: postId,
        starRating: starRating,
        textContent: reviewText,
        likes: [],
        createTime: currTime
    };

    const updateResult = await postCol.updateOne(
        { "musicContent._id": ratingId },
        {
            $push: { "musicContent.$.ratings": rating }
        }
    );

    if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
        errorMessage(
            MOD_NAME,
            "ratePlaylist",
            `Failed to add rating: Post not found or update failed.`
        );
    }

    const userCol = await users();
    const userUpdateInfo = await userCol.updateOne(
        { _id: userId },
        {
            $push: { ratings: ratingId }
        }
    );

    if (
        !userUpdateInfo ||
        userUpdateInfo.matchedCount === 0 ||
        userUpdateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "ratePlaylist",
            `Unable to like this rating. It might not exist.`
        );
    }
};

/**
 * searches the database for posts whose text content matches the given search term
 *
 * @param {string | ObjectId}   the user who is currently searching (so we can show/hide posts depending on profile status and friendships)
 * @param {string} searchTerm   string to be used in keyword search of post text content
 *
 * @returns {[Object]} post objects found from the keyword search
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const searchPosts = async (userId, searchTerm) => {
    userId = vld.checkObjectId(userId);

    searchTerm = vld.returnValidString(searchTerm);
    vld.checkEmptyString(searchTerm);

    const postCol = await posts();
    const reSearch = new RegExp(`.*${searchTerm}.*`, "gi"); // matches when searchTerm appears anywhere in the string (case insensitive)

    const results = await postCol.find({ textContent: reSearch }).toArray(); // match on both usernames and

    const currUser = await userData.getUser(userId);
    const userCol = await users();
    const searchablePosters = await userCol
        .find({
            $or: [
                { publicProfile: true },
                { _id: { $in: currUser.friends.concat([userId]) } }
            ]
        })
        .toArray(); // we'll only show posts from public users, or from users who are friended (or from the current user)
    const searchableIds = searchablePosters.map((usr) => usr._id.toString());

    const actualResults = results.filter((pst) =>
        searchableIds.includes(pst.authorId.toString())
    ); // only use results where the authors posts would be viewable to the current user

    return actualResults;
};

const exportedMethods = {
    createPost,
    getPost,
    updatePost,
    deletePost,
    getUserPosts,
    generateFeed,
    likePost,
    commentPost,
    likeComment,
    ratePlaylist,
    searchPosts
};

export default exportedMethods;
