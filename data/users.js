/**
 * methods to interact with data from the "users" collection
 */

import { users } from "../config/mongoCollections.js";
import vld from "../helpers/validation.js";
import errorMessage from "../helpers/error.js";

const MOD_NAME = "data/users.js";

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

    // add other fields as [] or null (content not populated yet)
    newUser.SPAuth = null;
    newUser.AMAuth = null;

    newUser.friends = [];
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
 * given a user id, add the supplied api access data as a SPAuth subdocument
 *
 * @param {string} id               id of user to be updated
 * @param {string} accessToken      access token used to get data from SP API
 * @param {number} expiryTime       time in Unix epoch seconds at which the access token expires
 * @param {string} refreshToken     used to fetch a new accessToken after its expiry time
 *
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
};

const exportedMethods = {
    registerUser,
    addSPAccessData
};

export default exportedMethods;
