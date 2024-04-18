/**
 * populate the database with test data
 */

import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { users } from "../config/mongoCollections.js";

import { userData, postData } from "../data/index.js";

const db = await dbConnection();
await db.dropDatabase();

const user1 = await userData.registerUser(
    "jgraham5",
    "password",
    "08/30/2003",
    undefined,
    "John Graham"
);
const user2 = await userData.registerUser(
    "ehodor",
    "1234",
    "02/10/2003",
    undefined, // defaults to true
    "Emma Hodor"
);
const user3 = await userData.registerUser(
    "anonymous",
    "test",
    "03/11/2004",
    false,
    undefined // should be set to null (ignored)
);

const userCol = await users();
const allUsers = await userCol.find({}).toArray();

console.log(allUsers.length); // should be 3
console.log(allUsers);

// console.log(`Should be false (failed password attempt) ${await userData.comparePassword(user1._id, "helloWrongPassword")}`);
// console.log(`Should be true (successful password attempt) ${await userData.comparePassword(user1._id, "password")}`);

// await userData.addFriend(user1._id, user2._id);
// await userData.blockUser(user2._id, user1._id);

// const user1New = await userData.getUser(user1._id);
// const user2New = await userData.getUser(user2._id);

// console.log(user1New);
// console.log(user2New);

// await userData.removeFriend(user1._id, user2._id);
// await userData.unblockUser(user2._id, user1._id);

// const user1Newer = await userData.getUser(user1._id);
// const user2Newer = await userData.getUser(user2._id);

// console.log(user1Newer);
// console.log(user2Newer);

// const usernameFind1 = await userData.findByUsername("jgraham5");
// console.log(usernameFind1);

// const usernameFind2 = await userData.findByUsername("ehodor5");
// console.log(usernameFind2); // no such username, should return null

// try {
//     const notAllowed = await userData.registerUser(
//         "jgraham5",
//         "pp",
//         "pp",
//         "pp"
//     );
//     console.log(notAllowed);
// } catch (e) {
//     console.log(e);
// }

await closeConnection();
