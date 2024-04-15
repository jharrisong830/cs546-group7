/**
 * methods to interact with data from the "users" collection
 */

import { users } from "../config/mongoCollections.js";
import vld from "../helpers/validation.js";
import errorMessage from "../helpers/error.js";
import bcrypt from "bcrypt";

const MOD_NAME = "data/users.js";
const saltRounds = 16;

const updatable = ["username", "email", "password", "name"];

/**
 * registers a user and places identifying information in the database
 *
 * @param {string} username             login/site handle
 * @param {string} email                registration/login/contact email
 * @param {string} password             login password
 * @param {string} dateOfBirth          date of birth as ISO-formatted date string
 * @param {boolean} publicProfile=true  whether posts and profile data are public to all users
 * @param {string} [name]               display name (optional)
 *
 * @returns {Object} the registered user object, as it was inserted into the database collection
 * @throws on invalid input or if there is an error adding the object to the database collection
 */
const registerUser = async (
    username,
    email,
    password,
    dateOfBirth,
    publicProfile = true,
    name
) => {
    let newUser = vld.validateUserParams(
        // validate parameters
        username,
        email,
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

    if ((await unames.length) === 0) return null;

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

    if (!usr)
        errorMessage(
            MOD_NAME,
            "comparePassword",
            `No user with '${id}' was found`
        );

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

    const friend = await getUser(friendId); // make sure the user exists
    if (!friend)
        errorMessage(
            MOD_NAME,
            "addFriend",
            `No user with '${friendId}' was found`
        );

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

    return await getUser(id); // return the updated user
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

    return await getUser(id); // return the updated user
};

/**
 * adds otherId to the current users blocked list
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
    if (!other)
        errorMessage(
            MOD_NAME,
            "blockUser",
            `No user with '${otherId}' was found`
        );

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

    return await getUser(id); // return the updated user
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

    return await getUser(id); // return the updated user
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
    const updateInfo = await userCol.updateOne(
        { _id: id },
        {
            $set: { publicProfile: { $not: "$publicProfile" } } // toggle the value of publicProfile
        }
    );

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

        updatedFields[field] = vld.returnValidString(updatedFields[field]); // TODO: character validation for different fields
        vld.checkEmptyString(updatedFields[field]);
    });

    if (Object.keys(updatedFields).includes("password")) {
        if (field === "password") {
            updatedFields.password = await bcrypt.hash(
                updatedFields.password,
                saltRounds
            ); // hash password with 16 salt rounds
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
    blockUser,
    unblockUser,
    toggleProfileVisibility,
    updateUser
};

export default exportedMethods;
