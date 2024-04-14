/**
 * populate the database with test data
 */

import { dbConnection, closeConnection } from "../config/mongoConnection.js";

import { userData, postData } from "../data/index.js";

const db = await dbConnection();
await db.dropDatabase();

const user1 = await userData.registerUser(
    "jgraham5",
    "jgraham5@stevens.edu",
    "password",
    "08/30/2003",
    undefined,
    "John Graham"
);
const user2 = await userData.registerUser(
    "ehodor",
    "ehodor@stevens.edu",
    "1234",
    "02/10/2003",
    undefined,
    "Emma Hodor"
);

console.log(user1);
console.log(user2);

// console.log(`Should be false (failed password attempt) ${await userData.comparePassword(user1._id, "helloWrongPassword")}`);
// console.log(`Should be true (successful password attempt) ${await userData.comparePassword(user1._id, "password")}`);

await userData.addFriend(user1._id, user2._id);
await userData.blockUser(user2._id, user1._id);

const user1New = await userData.getUser(user1._id);
const user2New = await userData.getUser(user2._id);

console.log(user1New);
console.log(user2New);

await userData.removeFriend(user1._id, user2._id);
await userData.unblockUser(user2._id, user1._id);

const user1Newer = await userData.getUser(user1._id);
const user2Newer = await userData.getUser(user2._id);

console.log(user1Newer);
console.log(user2Newer);

const usernameFind1 = await userData.findByUsername("jgraham5");
console.log(usernameFind1);

const usernameFind2 = await userData.findByUsername("ehodor5");
console.log(usernameFind2); // no such username, should return null

try {
    const notAllowed = await userData.registerUser(
        "jgraham5",
        "pp",
        "pp",
        "pp"
    );
    console.log(notAllowed);
} catch (e) {
    console.log(e);
}

await closeConnection();
