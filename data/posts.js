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
    const post = await postCol
        .find({ _id: id })
        .sort({ "comments.createTime": -1 }) // sort comments in reverse chronological order (TODO, doesn't work)
        .toArray();

    if (!post)
        errorMessage(MOD_NAME, "getPost", `No post with '${id}' was found`);
    return post[0];
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
        .find({ authorId: { $in: usr.friends.concat([id]) } }) // get all posts by this user's friends, and this user!
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
 * If the post is already liked by the user, it removes their like.
 *
 * @param {string | ObjectId} id       the post id to like
 * @param {string | ObjectId} userId   the user id of the user liking the post
 * @returns {Promise<boolean>}         returns true if post was liked, false if unliked
 * @throws if the operation is unsuccessful
 */
const likePost = async (id, userId) => {
    id = vld.checkObjectId(id);
    userId = vld.checkObjectId(userId);

    const postCol = await posts();

    const likedPost = await postCol.findOne({ _id: id, likes: userId });
    if (likedPost) {
        // The user has already like the post
        const updateInfo = await postCol.updateOne(
            { _id: id },
            { $pull: { likes: userId } }
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
            { $pull: { postLikes: id } }
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

        return false; // Return false to resemble the post being unliked
    }

    // Only will reach this if user hasn't liked the post already
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

    return true; // Return true to resemble the post being liked
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

    const usr = await userData.getUser(userId);

    const currTime = Math.floor(Date.now() / 1000); // get unix epoch seconds
    let commentId = new ObjectId();

    let comment = {
        _id: commentId,
        authorId: userId,
        authorUsername: usr.username,
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
 * If the comment is already liked by the user, it removes their like.
 *
 * @param {string | ObjectId} commentId   the comment id of the comment being liked
 * @param {string | ObjectId} userId      the user id of the user liking the comment
 *
 * @returns {boolean}            returns true if comment was liked, false if unliked
 * @throws if the operation is unsuccessful
 */
const likeComment = async (commentId, userId) => {
    commentId = vld.checkObjectId(commentId);
    userId = vld.checkObjectId(userId);

    const postCol = await posts();
    const userCol = await users();

    const likedComment = await postCol.findOne(
        { "comments._id": commentId },
        { projection: { "comments.$": 1 } }
    ); // only fetches the given comment

    if (!likedComment) {
        errorMessage(
            MOD_NAME,
            "likeComment",
            `Unable to like this comment. It might not exist.`
        );
    }

    const commentLikes = likedComment.comments[0].likes.map((objId) =>
        objId.toString()
    ); // get like user ids as strings

    if (commentLikes.includes(userId.toString())) {
        // if already liked, we must unlike this comment
        const updateInfo = await postCol.updateOne(
            { "comments._id": commentId },
            { $pull: { "comments.$.likes": userId } }
        );

        if (
            !updateInfo ||
            updateInfo.matchedCount === 0 ||
            updateInfo.modifiedCount === 0
        ) {
            errorMessage(
                MOD_NAME,
                "likeComment",
                `Unable to unlike this comment. It might not exist.`
            );
        }

        const userUpdateInfo = await userCol.updateOne(
            { _id: userId },
            { $pull: { commentLikes: commentId } }
        );

        if (
            !userUpdateInfo ||
            userUpdateInfo.matchedCount === 0 ||
            userUpdateInfo.modifiedCount === 0
        ) {
            errorMessage(
                MOD_NAME,
                "likeComment",
                `Unable to update this user.`
            );
        }

        return false; // return false, indicates unlike
    } else {
        // otherwise, add this user to the likers
        const updateInfo = await postCol.updateOne(
            { "comments._id": commentId },
            { $push: { "comments.$.likes": userId } }
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

        const userUpdateInfo = await userCol.updateOne(
            { _id: userId },
            { $push: { commentLikes: commentId } }
        );

        if (
            !userUpdateInfo ||
            userUpdateInfo.matchedCount === 0 ||
            userUpdateInfo.modifiedCount === 0
        ) {
            errorMessage(
                MOD_NAME,
                "likeComment",
                `Unable to update this user.`
            );
        }

        return true; // return true, indicates a like!
    }
};

// implement the adding of ratings to playlists, will work similar to comments, with extra fields to add ratings (x/5)

/**
 * Rates a playlist within a post by adding a rating object to the musicContent.ratings array.
 * If the user has already made a rating on the playlist, the function will return a string.
 * If the user is attempting make a rating on their own playlist, the function will also return a string.
 *
 * @param {string | ObjectId} id          The ID of the post containing the playlist to rate.
 * @param {string | ObjectId} userId      The ID of the user who is rating the playlist.
 * @param {number} starRating             The star rating given to the playlist (scale of 1 to 5).
 * @param {string} reviewText             Optional text content explaining the rating.
 *
 * @returns {Object | string}             The newly created rating subdocument or a string message if the rating could not be added.
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
    const post = await postCol.findOne({ _id: id }, { "musicContent._id": 1 }); // Post with a playlist type should ALWAYS have music content

    let musicContentId = post.musicContent._id;

    if (post.authorId.equals(userId)) {
        return "You cannot make a rating of your own playlist.";
    }

    const existingRating = post.musicContent.ratings.find((r) =>
        r.authorId.equals(userId)
    );
    if (existingRating) {
        return "You have already rated this playlist.";
    }

    const currTime = Math.floor(Date.now() / 1000); // get unix epoch seconds
    let ratingId = new ObjectId();

    const usr = await userData.getUser(userId);

    const rating = {
        _id: ratingId,
        authorId: userId,
        authorUsername: usr.username,
        parentId: musicContentId, // Changed parentId to musicContentId from id because rating object's parent is musicContent NOT the actual post
        starRating: starRating,
        textContent: reviewText,
        likes: [],
        createTime: currTime
    };

    let mc = post.musicContent;

    const updateResult = await postCol.updateOne(
        { _id: id },
        {
            $push: { "musicContent.ratings": rating }
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

    return rating;
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

/**
 * searches the database for posts whose playlist music content matches the given search term
 *
 * @param {string | ObjectId}   the user who is currently searching (so we can show/hide posts depending on profile status and friendships)
 * @param {string} searchTerm   string to be used in keyword search of playlist data
 *
 * @returns {[Object]} post objects found from the keyword search
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const searchPlaylists = async (userId, searchTerm) => {
    userId = vld.checkObjectId(userId);

    searchTerm = vld.returnValidString(searchTerm);
    vld.checkEmptyString(searchTerm);

    const postCol = await posts();
    const reSearch = new RegExp(`.*${searchTerm}.*`, "gi"); // matches when searchTerm appears anywhere in the string (case insensitive)

    const results = await postCol
        .find({
            $or: [
                { "musicContent.name": reSearch },
                { "musicContent.tracks.name": reSearch },
                { tags: reSearch }
            ],
            "musicContent.type": "playlist"
        })
        .toArray(); // get only posts with playlists, and search for playlists with titles/tracks/tags matching the search

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

/**
 * Likes or unlikes a rating on a playlist within a post.
 *
 * @param {string | ObjectId} ratingId  the rating id of the rating being liked or unliked
 * @param {string | ObjectId} userId    the user id of the user liking or unliking the rating
 * @returns {Promise<boolean>}          returns true if the rating was liked, false if unliked
 * @throws if the operation is unsuccessful
 */
const likeRating = async (ratingId, userId) => {
    ratingId = vld.checkObjectId(ratingId);
    userId = vld.checkObjectId(userId);

    const postCol = await posts();
    const userCol = await users();

    // Find the rating in any post to check if it's already liked by this user
    const postWithRating = await postCol.findOne(
        { "musicContent.ratings._id": ratingId },
        { projection: { "musicContent.$": 1 } }
    );

    if (!postWithRating) {
        errorMessage(
            MOD_NAME,
            "likeRating",
            `Unable to like this rating. It might not exist.`
        );
    }

    const rating = postWithRating.musicContent.ratings.find((r) =>
        r._id.equals(ratingId)
    );

    const ratingLikes = rating.likes.map((id) => id.toString());

    if (ratingLikes.includes(userId.toString())) {
        // User already liked the rating, so unlike it
        const updateInfo = await postCol.updateOne(
            { "musicContent.ratings._id": ratingId },
            { $pull: { "musicContent.ratings.$.likes": userId } }
        );

        if (
            !updateInfo ||
            updateInfo.matchedCount === 0 ||
            updateInfo.modifiedCount === 0
        ) {
            errorMessage(
                MOD_NAME,
                "likeRating",
                `Unable to unlike this rating. It might not exist.`
            );
        }

        // Update the user's document to remove the like
        const userUpdateInfo = await userCol.updateOne(
            { _id: userId },
            { $pull: { ratingLikes: ratingId } }
        );

        if (
            !userUpdateInfo ||
            userUpdateInfo.matchedCount === 0 ||
            userUpdateInfo.modifiedCount === 0
        ) {
            errorMessage(
                MOD_NAME,
                "likeRating",
                `Unable to unlike this rating. It might not exist.`
            );
        }

        return false; // Indicates rating was unliked
    } else {
        // User has not liked the rating, so add the like
        const updateInfo = await postCol.updateOne(
            { "musicContent.ratings._id": ratingId },
            { $push: { "musicContent.ratings.$.likes": userId } }
        );

        if (
            !updateInfo ||
            updateInfo.matchedCount === 0 ||
            updateInfo.modifiedCount === 0
        ) {
            errorMessage(
                MOD_NAME,
                "likeRating",
                `Unable to like this rating. It might not exist.`
            );
        }

        // Update user's document to add the like
        const userUpdateInfo = await userCol.updateOne(
            { _id: userId },
            { $push: { ratingLikes: ratingId } }
        );

        if (
            !userUpdateInfo ||
            userUpdateInfo.matchedCount === 0 ||
            userUpdateInfo.modifiedCount === 0
        ) {
            errorMessage(
                MOD_NAME,
                "likeRating",
                `Unable to like this rating. It might not exist.`
            );
        }

        return true; // Indicates rating was liked
    }
};

/**
 * Retrieves a specific comment by its ID.
 * This function searches all posts for the specified comment ID and returns the comment if found.
 *
 * @param {string | ObjectId} commentId  The ID of the comment to get.
 * @returns {Object}                     The comment object found.
 * @throws                               Throws an error if necessary.
 */
const getComment = async (commentId) => {
    // Not sure if needed
    commentId = vld.checkObjectId(commentId);

    const postCol = await posts();

    const comment = await postCol.findOne(
        { "comments._id": commentId },
        { projection: { "comments.$": 1 } }
    );

    if (!comment) {
        errorMessage(
            MOD_NAME,
            "getComment",
            `No coment with '${commentId}' was found`
        );
    }

    return comment;
};

/**
 * Retrieves all comments made by a specific user.
 * This function searches all posts for comments made by the specified user and returns them in an array.
 *
 * @param {string | ObjectId} userId  The user ID that helps comments.
 * @returns {Array<Object>}           An array of comment subdocuments made by the user.
 * @throws                            Throws an error if the input is invalid or if the operation fails.
 */
const getUserComments = async (userId) => {
    userId = vld.checkObjectId(userId);

    const postCol = await posts();

    const postsWithUserComments = await postCol
        .find(
            // Find all posts that contain comments by this user
            { "comments.authorId": userId },
            { projection: { "comments.$": 1 } }
        )
        .toArray();

    let userComments = [];
    postsWithUserComments.forEach((post) => {
        const comments = post.comments.filter((comment) =>
            comment.authorId.equals(userId)
        );
        userComments.push(...comments);
    });

    return userComments;
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
    searchPosts,
    searchPlaylists,
    likeRating,
    getComment,
    getUserComments
};

export default exportedMethods;
