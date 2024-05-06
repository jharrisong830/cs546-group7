/**
 * methods to interact with data from the "users" collection
 */

import { users, posts } from "../config/mongoCollections.js";
import vld from "../helpers/validation.js";
import errorMessage from "../helpers/error.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

const MOD_NAME = "data/users.js";
const saltRounds = 16;

const updatable = ["username", "password", "name"];

/**
 * registers a user and places identifying information in the database
 *
 * @param {string} username             login/site handle
 * @param {string} password             login password
 * @param {string} dateOfBirth          date of birth as ISO-formatted date string
 * @param {boolean} [publicProfile]     whether posts and profile data are public to all users (default -> true)
 * @param {string} [name]               display name (optional)
 *
 * @returns {Object} the registered user object, as it was inserted into the database collection
 * @throws on invalid input or if there is an error adding the object to the database collection
 */
const registerUser = async (
    username,
    password,
    dateOfBirth,
    publicProfile = true,
    name
) => {
    let newUser = await vld.validateUserParams(
        // validate parameters
        username,
        password,
        dateOfBirth,
        publicProfile,
        name
    );

    if ((await findByUsername(username)) !== null)
        errorMessage(
            MOD_NAME,
            "validateUserParams",
            `The username ${username} is already taken.`
        );

    newUser.password = await bcrypt.hash(newUser.password, saltRounds); // hash password with 16 salt rounds

    // add other fields as [] or null (content not populated yet)
    newUser.SPAuth = null;
    newUser.AMAuth = null;

    newUser.friends = [];
    newUser.friendRequests = [];
    newUser.messages = [];
    newUser.blocked = [];
    newUser.posts = [];
    newUser.comments = [];
    newUser.postLikes = [];
    newUser.commentLikes = [];
    newUser.ratings = [];

    const userCol = await users();
    const insertInfo = await userCol.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        errorMessage(
            MOD_NAME,
            "registerUser",
            `failed to register new user '${newUser.username}'`
        );
    }
    return await userCol.findOne({ _id: insertInfo.insertedId }); // return the object just added to the db
};

/**
 * fetch a user object from the database
 * @param {string | ObjectId} id    unique user id
 *
 * @returns {Object} the full user object
 * @throws if id is invalid or such a user does not exist
 */
const getUser = async (id) => {
    id = vld.checkObjectId(id);

    const userCol = await users();
    const usr = await userCol.findOne({ _id: id });

    if (!usr)
        errorMessage(MOD_NAME, "getUser", `No user with '${id}' was found`);
    return usr;
};

/**
 * returns the id of the user with a matching username
 *
 * @param {string} username to search for
 *
 * @returns {ObjectId | null} the _id and username of the matching user, null if no such user is found
 * @throws on invalid input or if there is an error querying the database
 */
const findByUsername = async (username) => {
    username = vld.returnValidString(username);
    vld.checkEmptyString(username);
    username = username.toLowerCase();

    // find matching username (this should either return 1 or none, no duplicate usernames)
    const userCol = await users();
    const matchingUsernames = await userCol.find(
        { username: username },
        { username: 1 }
    ); // return the _id and username of matching users

    const unames = await matchingUsernames.toArray();

    if (unames.length === 0) return null;

    return unames[0]._id; // return the _id!
};

/**
 * checks a given password against the stored hash for the user with the given id (for login/authentication purposes)
 *
 * @param {string | ObjectId} id    id of the user to check password of
 * @param {string} pswd             password to check
 *
 * @returns {boolean} whether the password matches
 * @throws on invalid input or if there is an error querying the database
 */
const comparePassword = async (id, pswd) => {
    id = vld.checkObjectId(id);

    pswd = vld.returnValidString(pswd);
    vld.checkEmptyString(pswd);

    const usr = await getUser(id); // get the user

    return await bcrypt.compare(pswd, usr.password); // compare pswd plaintext with the user's hashed password
};

/**
 * adds friendId to the current users friend list (this is a one-way friend action)
 * @param {string | ObjectId} currId    current user to be updated with a new friend
 * @param {string | ObjectId} friendId  friend to be added
 *
 * @returns {Object} updated user
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const addFriend = async (currId, friendId) => {
    currId = vld.checkObjectId(currId);
    friendId = vld.checkObjectId(friendId);

    if (await checkBlocked(currId, friendId)) {
        errorMessage(
            MOD_NAME,
            "addFriend",
            `${currId} and ${friendId} might be blocked, cannot add friends`
        );
    }

    const friend = await getUser(friendId); // make sure the user exists

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: currId },
        {
            $push: { friends: friendId }
        }
    );

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "addFriend",
            `Unable to modify database entry for ${currId}. This object might not exist`
        );
    }

    return await getUser(currId); // return the updated user
};

/**
 * removes friendId from the current users friend list (this is a one-way friend action)
 * @param {string | ObjectId} currId    current user to be updated
 * @param {string | ObjectId} friendId  friend id to be removed
 *
 * @returns {Object} updated user
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const removeFriend = async (currId, friendId) => {
    currId = vld.checkObjectId(currId);
    friendId = vld.checkObjectId(friendId);

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: currId },
        {
            $pull: { friends: friendId }
        }
    );

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "removeFriend",
            `Unable to modify database entry for ${currId}. This object might not exist, or ${friendId} might not be in the array`
        );
    }

    return await getUser(currId); // return the updated user
};

/**
 * unlinks the friendship status of two users (both users will be removed from each other's friend lists)
 * @param {string | ObjectId} currId    current user
 * @param {string | ObjectId} friendId  friend id
 */
const forceUnfriend = async (currId, friendId) => {
    try {
        await removeFriend(currId, friendId);
    } catch {
        console.log(
            `${friendId} was already not in current users friend list. Skipping!`
        );
    }
    try {
        await removeFriend(friendId, currId);
    } catch {
        console.log(
            `current user was already not in ${friendId}s friend list. Skipping!`
        );
    }
};

/**
 * adds otherId to the current users blocked list, and removes the users from each other's friend lists
 * @param {string | ObjectId} currId   current user to be updated with a new blocked user
 * @param {string | ObjectId} otherId  user to be blocked
 *
 * @returns {Object} updated user
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const blockUser = async (currId, otherId) => {
    currId = vld.checkObjectId(currId);
    otherId = vld.checkObjectId(otherId);

    const other = await getUser(otherId); // make sure the user exists

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: currId },
        {
            $push: { blocked: otherId }
        }
    );

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "blockUser",
            `Unable to modify database entry for ${currId}. This object might not exist`
        );
    }

    await forceUnfriend(currId, otherId); // force the removal of these users from each other's friend lists

    return await getUser(currId); // return the updated user
};

/**
 * removes otherId from the current users blocked list
 * @param {string | ObjectId} currId    current user to be updated
 * @param {string | ObjectId} otherId   other id to be removed
 *
 * @returns {Object} updated user
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const unblockUser = async (currId, otherId) => {
    currId = vld.checkObjectId(currId);
    otherId = vld.checkObjectId(otherId);

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: currId },
        {
            $pull: { blocked: otherId }
        }
    );

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "unblockUser",
            `Unable to modify database entry for ${currId}. This object might not exist, or ${otherId} might not be in the array`
        );
    }

    return await getUser(currId); // return the updated user
};

/**
 * returns true if either user appears in the others block list, false otherwise
 * (any blocked users will not be able to interact with each other on the feed)
 *
 * @param {*} currId    first user
 * @param {*} otherId   second user
 *
 * @returns {boolean}   true if any blocking has occured, false otherwise
 * @throws on invalid input
 */
const checkBlocked = async (currId, otherId) => {
    currId = vld.checkObjectId(currId);
    otherId = vld.checkObjectId(otherId);

    const usr1 = await getUser(currId);
    const usr2 = await getUser(otherId);

    const currBlocked = usr1.blocked.map((objId) => objId.toString()); // convert to strings for array includes
    const otherBlocked = usr2.blocked.map((objId) => objId.toString());

    return (
        currBlocked.includes(otherId.toString()) ||
        otherBlocked.includes(currId.toString())
    ); // returns false only if neither user is blocked by one another
};

/**
 *
 * @param {*} messageContent   message that the user wants to send
 * @param {*} senderUsername   the username of the sender
 * @param {*} recipientUsername    the username of the recipient
 * @returns   message if it was successful
 * @throws on invalid input
 */

const createMessage = async (
    messageContent,
    senderUsername,
    recipientUsername
) => {
    if (
        !messageContent ||
        typeof messageContent !== "string" ||
        messageContent.trim().length === 0
    ) {
        throw "You must provide something to send!";
    }

    if (messageContent.trim().length >= 2000) {
        throw "message content must be less than 2000 characters.";
    }
    messageContent = messageContent.trim();

    const userCol = await users();

    const sender = await findByUsername(senderUsername);
    const recipient = await findByUsername(recipientUsername);

    if (!sender || !recipient) {
        throw "Both sender and recipient must be valid users.";
    }

    if (sender === recipient) {
        throw "You cannot send a message to yourself!";
    }

    const isBlocked = await checkBlocked(
        sender.toHexString(),
        recipient.toHexString()
    );
    if (isBlocked) {
        throw "Messaging blocked. One of the users has blocked the other.";
    }

    // https://stackoverflow.com/questions/10599148/how-do-i-get-the-current-time-only-in-javascript
    const currTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
    const newMessage = {
        _id: new ObjectId(),
        from: senderUsername,
        to: recipientUsername,
        content: messageContent,
        timestamp: currTime
    };

    const updateInfoRecipient = await userCol.updateOne(
        { _id: new ObjectId(recipient) },
        { $push: { messages: newMessage } }
    );

    const updateInfoSender = await userCol.updateOne(
        { _id: new ObjectId(sender) },
        { $push: { messages: newMessage } }
    );

    if (
        !updateInfoSender.acknowledged ||
        updateInfoSender.modifiedCount !== 1 ||
        !updateInfoRecipient.acknowledged ||
        updateInfoRecipient.modifiedCount !== 1
    ) {
        throw `Failed to add new message from ${senderUsername} to ${recipientUsername}`;
    }

    return newMessage;
};

/**
 * gets all the messages that the user has
 *
 * @param {*} username   username of the current user
 * @returns        all the messages that the user has from the database
 */
const getMessages = async (username) => {
    const userCol = await users(username);
    const user = await userCol.findOne({ username: username });

    if (!user) {
        throw "User not found";
    }

    return user.messages;
};

/**
 * toggles the visibility status of a user's profile
 *
 * @param {string | ObjectId} id    user to be altered
 *
 * @returns {Object} updated user
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const toggleProfileVisibility = async (id) => {
    id = vld.checkObjectId(id);
    vld.checkEmptyString(id);

    const userCol = await users();
    const updateInfo = await userCol.updateOne({ _id: id }, [
        // NOTE: use array of set commands to be able to use aggregation ($not)
        {
            $set: { publicProfile: { $not: "$publicProfile" } } // toggle the value of publicProfile
        }
    ]);

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "toggleProfileVisibility",
            `Unable to modify database entry for ${id}. This object might not exist`
        );
    }

    return await getUser(id); // return the updated user
};

/**
 * updates the fields of a users profile to the specified values
 * (note: only username, email, password, and name can be updated. any other field will throw error)
 *
 * @param {string | ObjectID} id    id of user to be updated
 * @param {Object} updatedFields    object containing at least one valid field to be updated
 *
 * @returns {Object} newly updated user object
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const updateUser = async (id, updatedFields) => {
    id = vld.checkObjectId(id);

    if (
        updatedFields === undefined ||
        updatedFields === null ||
        typeof updatedFields !== "object"
    ) {
        errorMessage(
            MOD_NAME,
            "updateUser",
            "Invalid input for 'updatedFields', expected an object."
        );
    }

    if (Object.keys(updatedFields).length === 0)
        errorMessage(
            MOD_NAME,
            "updateUser",
            "'updatedFields' has no key/value pairs!"
        );

    Object.keys(updatedFields).forEach((field) => {
        // validation!!!
        if (!updatable.includes(field))
            errorMessage(
                MOD_NAME,
                "updateUser",
                `Unexpected field '${field}'; either does not exist or can't be updated.`
            );
    });

    if (Object.keys(updatedFields).includes("password")) {
        updatedFields.password = vld.validatePassword(updatedFields.password);
        updatedFields.password = await bcrypt.hash(
            updatedFields.password,
            saltRounds
        ); // hash password with 16 salt rounds
    }
    if (Object.keys(updatedFields).includes("username")) {
        updatedFields.username = await vld.validateUsername(
            updatedFields.username
        );
    }
    if (Object.keys(updatedFields).includes("name")) {
        updatedFields.name = vld.returnValidString(updatedFields.name);
        vld.checkEmptyString(updatedFields.name);
        if (updatedFields.name.length > 30) {
            errorMessage(
                MOD_NAME,
                "updateUser",
                "'name' must not have length greater than 30 chars!"
            );
        }
    }

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: id },
        { $set: updatedFields }
    ); // update all fields at once

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "updateUser",
            `Unable to modify database entry for ${id}. This object might not exist`
        );
    }

    return await getUser(id);
};

/**
 * given a user id, add the supplied api access data as a SPAuth subdocument
 *
 * @param {string | ObjectId} id    id of user to be updated
 * @param {string} accessToken      access token used to get data from SP API
 * @param {number} expiryTime       time in Unix epoch seconds at which the access token expires
 * @param {string} refreshToken     used to fetch a new accessToken after its expiry time
 *
 * @returns {Object} updated user
 * @throws if the update was unsuccessful (i.e. id was not found), or if input is invalid
 */
const addSPAccessData = async (id, accessToken, expiryTime, refreshToken) => {
    id = vld.checkObjectId(id); // validates and converts to object id

    accessToken = vld.returnValidString(accessToken);
    vld.checkEmptyString(accessToken);

    refreshToken = vld.returnValidString(refreshToken);
    vld.checkEmptyString(refreshToken);

    vld.checkUnsignedInt(expiryTime);

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: id },
        {
            $set: {
                // id is converted to ObjectId, so just set the thing
                SPAuth: {
                    // add the SPAuth subdocument
                    accessToken: accessToken,
                    expiryTime: expiryTime,
                    refreshToken: refreshToken
                }
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
            "addSPAccessData",
            `Unable to modify database entry for ${id}. This object might not exist`
        );
    }

    return await getUser(id);
};

/**
 * given a user id, add the supplied api access data as a AMAuth subdocument
 *
 * @param {string | ObjectId} id    id of user to be updated
 * @param {string} musicUserToken   access token used to get data from AM API
 *
 * @returns {Object} updated user
 * @throws if the update was unsuccessful (i.e. id was not found), or if input is invalid
 */
const addAMAccessData = async (id, musicUserToken) => {
    id = vld.checkObjectId(id); // validates and converts to object id

    musicUserToken = vld.returnValidString(musicUserToken);
    vld.checkEmptyString(musicUserToken);

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: id },
        {
            $set: {
                // id is converted to ObjectId, so just set the thing
                AMAuth: {
                    // add the AMAuth subdocument
                    musicUserToken: musicUserToken
                }
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
            "addAMAccessData",
            `Unable to modify database entry for ${id}. This object might not exist`
        );
    }

    return await getUser(id);
};

/**
 * given a user id, remove their spotify access data from the database
 *
 * @param {string | ObjectId} id    id of user to be updated
 *
 * @returns {Object} updated user
 * @throws if the update was unsuccessful (i.e. id was not found), or if input is invalid
 */
const removeSPAccessData = async (id) => {
    id = vld.checkObjectId(id);

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: id },
        { $set: { SPAuth: null } }
    ); // set sp auth data to null

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "removeSPAccessData",
            `Unable to modify database entry for ${id}. This object might not exist`
        );
    }

    return await getUser(id);
};

/**
 * given a user id, remove their apple music access data from the database
 *
 * @param {string | ObjectId} id    id of user to be updated
 *
 * @returns {Object} updated user
 * @throws if the update was unsuccessful (i.e. id was not found), or if input is invalid
 */
const removeAMAccessData = async (id) => {
    id = vld.checkObjectId(id);

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: id },
        { $set: { AMAuth: null } }
    ); // set am auth data to null

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "removeAMAccessData",
            `Unable to modify database entry for ${id}. This object might not exist`
        );
    }

    return await getUser(id);
};

/**
 * removes a user and all of their associated data from the database (including their posts)
 *
 * @param {string | ObjectId} id    id of the user to be removed
 *
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const deleteUser = async (id) => {
    id = vld.checkObjectId(id);

    const usr = await getUser(id);

    const postCol = await posts();
    const postDeleteInfo = await postCol.deleteMany({ authorId: id }); // delete all posts with an associated author id

    if (
        !postDeleteInfo ||
        !postDeleteInfo.acknowledged ||
        postDeleteInfo.deletedCount !== usr.posts.length
    ) {
        errorMessage(
            MOD_NAME,
            "deleteUser",
            `Unable to delete all posts for user ${id}`
        );
    }

    const userCol = await users();
    const userDeleteInfo = await userCol.deleteOne({ _id: id });

    if (
        !userDeleteInfo ||
        !userDeleteInfo.acknowledged ||
        userDeleteInfo.deletedCount !== 1
    ) {
        errorMessage(MOD_NAME, "deleteUser", `Unable to delete user ${id}`);
    }
};

/**
 * searches the database for users whose name or username contains text from searchTerm
 *
 * @param {string} searchTerm   string to be used in keyword search of user display names and usernames
 *
 * @returns {[Object]} user objects found from the keyword search
 * @throws on invalid input or if there are errors in getting/setting database entries
 */
const searchUsers = async (searchTerm) => {
    searchTerm = vld.returnValidString(searchTerm);
    vld.checkEmptyString(searchTerm);

    const userCol = await users();
    const reSearch = new RegExp(`.*${searchTerm}.*`, "gi"); // matches when searchTerm appears anywhere in the string (case insensitive)

    const results = await userCol
        .find({ $or: [{ username: reSearch }, { name: reSearch }] })
        .toArray(); // match on both usernames and display names

    return results;
};

//adds friend requests to array of friend requests
const addFriendRequest = async (currId, requesterId) => {
    currId = vld.checkObjectId(currId);
    requesterId = vld.checkObjectId(requesterId);

    if (await checkBlocked(currId, requesterId)) {
        errorMessage(
            MOD_NAME,
            "addFriendRequest",
            `${currId} and ${requesterId} might be blocked, cannot add friends`
        );
    }

    // check if the requester is already in the friendRequests array
    let requestList = await getUser(currId);
    let isIn = false;

    for (let x in requestList.friendRequests) {
        if (
            requestList.friendRequests[x].toString() === requesterId.toString()
        ) {
            isIn = true;
        }
    }

    if (isIn === false) {
        const friendRequest = await getUser(requesterId); // make sure the user exists

        const userCol = await users();
        const updateInfo = await userCol.updateOne(
            { _id: currId },
            {
                $push: { friendRequests: requesterId }
            }
        );

        if (
            !updateInfo ||
            updateInfo.matchedCount === 0 ||
            updateInfo.modifiedCount === 0
        ) {
            errorMessage(
                MOD_NAME,
                "addFriendRequest",
                `Unable to modify database entry for ${currId}. This object might not exist`
            );
        }
    }

    return await getUser(currId); // return the updated user
};

//takes in a user id, returns a list of objects. each object contains the requester's id and username
const getRequests = async (currId) => {
    currId = vld.checkObjectId(currId);

    const currentPerson = await getUser(currId); // make sure the user exists

    const currentRequests = currentPerson.friendRequests;
    let requestList = [];

    for (let x in currentRequests) {
        let requester = await getUser(currentRequests[x]);
        requestList.push({ id: requester._id, username: requester.username });
    }
    return requestList; // return the updated user
};

//takes in the user and requester's id, and removes the request from the user's friendRequests array
const removeFriendRequest = async (currId, requesterId) => {
    currId = vld.checkObjectId(currId);
    requesterId = vld.checkObjectId(requesterId);

    const userCol = await users();
    const updateInfo = await userCol.updateOne(
        { _id: currId },
        {
            $pull: { friendRequests: requesterId }
        }
    );

    if (
        !updateInfo ||
        updateInfo.matchedCount === 0 ||
        updateInfo.modifiedCount === 0
    ) {
        errorMessage(
            MOD_NAME,
            "removeFriendRequest",
            `Unable to modify database entry for ${currId}. This object might not exist, or ${requesterId} might not be in the array`
        );
    }

    return await getUser(currId); // return the updated user
};

const exportedMethods = {
    registerUser,
    getUser,
    addSPAccessData,
    addAMAccessData,
    removeSPAccessData,
    removeAMAccessData,
    findByUsername,
    comparePassword,
    addFriend,
    removeFriend,
    forceUnfriend,
    blockUser,
    unblockUser,
    checkBlocked,
    toggleProfileVisibility,
    updateUser,
    deleteUser,
    searchUsers,
    createMessage,
    getMessages,
    addFriendRequest,
    getRequests,
    removeFriendRequest
};

export default exportedMethods;
