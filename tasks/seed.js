/**
 * populate the database with test data
 */

import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { users } from "../config/mongoCollections.js";

import { userData, postData } from "../data/index.js";

const db = await dbConnection();
await db.dropDatabase();

// testing registration of valid users

let user1 = await userData.registerUser(
    "jgraham5",
    "password",
    "08/30/2003",
    undefined,
    "John Graham"
);
let user2 = await userData.registerUser(
    "ehodor",
    "1234",
    "02/10/2003",
    undefined, // defaults to true
    "Emma Hodor"
);
let user3 = await userData.registerUser(
    "anonymous",
    "test",
    "03/11/2004",
    false,
    undefined // should be set to null (ignored)
);
let user4 = await userData.registerUser(
    "jduran",
    "test2",
    "04/12/2005",
    true,
    "Justin Duran"
);
let user5 = await userData.registerUser(
    "rperalt1",
    "test3",
    "05/13/2006",
    true,
    "Ramses Peralta"
);
let user6 = await userData.registerUser(
    "ran3",
    "test3",
    "06/14/2007",
    true,
    "Rebecca An"
);

try {
    let failed = await userData.registerUser(
        "jGraham5", // despite differeing case, should be rejected for being the same username
        "pswd",
        "08/31/2003"
    );
    console.log(failed);
} catch (e) {
    console.log("Duplicate username rejection works!");
    console.log(e);
}

// testing the friend feature

user1 = await userData.addFriend(user1._id, user2._id); // one-way, so only user 1 will have friend list altered
user2 = await userData.addFriend(user2._id, user1._id); // reciporcation!

user1 = await userData.addFriend(user1._id, user4._id); // one-way
user4 = await userData.getUser(user4._id); // should be unchanged

user4 = await userData.toggleProfileVisibility(user4._id); // profile visibility should now be false

console.log(user1, user2, user4);

await userData.forceUnfriend(user4._id, user1._id);
user1 = await userData.getUser(user1._id);

console.log("Force unfriend by user4, removes user4 from user1's friend list");
console.log(user1);
console.log(
    `User 1 and User 4 blocked? ${await userData.checkBlocked(user1._id, user4._id)}`
); // should be false

user1 = await userData.blockUser(user1._id, user2._id); // user2 will be in user1 block list, both will be removed from each other's friend lists
user2 = await userData.getUser(user2._id);

console.log("Two-way forced friend removal and block of user2 by user1");
console.log(user1);
console.log(user2);
console.log(
    `User 1 and User 2 blocked? ${await userData.checkBlocked(user1._id, user2._id)}`
); // should be true

try {
    let failed = await userData.addFriend(user2._id, user1._id);
    console.log(failed);
} catch (e) {
    console.log("Blocking works! Can't add someone who blocked you");
    console.log(e);
}

try {
    let failed = await userData.addFriend(user1._id, user2._id);
    console.log(failed);
} catch (e) {
    console.log("Again! works both ways");
    console.log(e);
}

await closeConnection();
