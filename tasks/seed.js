/**
 * populate the database with test data
 */

import { dbConnection, closeConnection } from "../config/mongoConnection.js";

import { userData, postData } from "../data/index.js";

const db = await dbConnection();

console.log("Dropping database entries...");

await db.dropDatabase();

// testing registration of valid users

console.log("Creating users...");

let user1 = await userData.registerUser(
    "jgraham5",
    "passworD123*",
    "2003-08-30",
    undefined,
    "John Graham"
);
let user2 = await userData.registerUser(
    "ehodor",
    "1234emmaH&",
    "2003-02-10",
    undefined, // defaults to true
    "Emma Hodor"
);
// let user3 = await userData.registerUser(
//     "anonymous",
//     "test",
//     "03/11/2004",
//     false,
//     undefined // should be set to null (ignored)
// );
let user4 = await userData.registerUser(
    "jduran",
    "Wustin*456",
    "2005-04-12",
    true,
    "Justin Duran"
);
// let user5 = await userData.registerUser(
//     "rperalt1",
//     "test3",
//     "05/13/2006",
//     true,
//     "Ramses Peralta"
// );
// let user6 = await userData.registerUser(
//     "ran3",
//     "test3",
//     "06/14/2007",
//     true,
//     "Rebecca An"
// );

// try {
//     let failed = await userData.registerUser(
//         "jGraham5", // despite differeing case, should be rejected for being the same username
//         "pswd",
//         "08/31/2003"
//     );
//     console.log(failed);
// } catch (e) {
//     console.log("Duplicate username rejection works!");
//     console.log(e);
// }

// testing the friend feature

console.log("Making friends along the way...");

user1 = await userData.addFriend(user1._id, user2._id); // one-way, so only user 1 will have friend list altered
user2 = await userData.addFriend(user2._id, user1._id); // reciporcation!

user1 = await userData.addFriend(user1._id, user4._id); // one-way
user4 = await userData.getUser(user4._id); // should be unchanged

user4 = await userData.toggleProfileVisibility(user4._id); // profile visibility should now be false

// console.log(user1, user2, user4);

// await userData.forceUnfriend(user4._id, user1._id);
// user1 = await userData.getUser(user1._id);

// console.log("Force unfriend by user4, removes user4 from user1's friend list");
// console.log(user1);
// console.log(
//     `User 1 and User 4 blocked? ${await userData.checkBlocked(user1._id, user4._id)}`
// ); // should be false

// user1 = await userData.blockUser(user1._id, user2._id); // user2 will be in user1 block list, both will be removed from each other's friend lists
// user2 = await userData.getUser(user2._id);

// console.log("Two-way forced friend removal and block of user2 by user1");
// console.log(user1);
// console.log(user2);
// console.log(
//     `User 1 and User 2 blocked? ${await userData.checkBlocked(user1._id, user2._id)}`
// ); // should be true

// try {
//     let failed = await userData.addFriend(user2._id, user1._id);
//     console.log(failed);
// } catch (e) {
//     console.log("Blocking works! Can't add someone who blocked you");
//     console.log(e);
// }

// try {
//     let failed = await userData.addFriend(user1._id, user2._id);
//     console.log(failed);
// } catch (e) {
//     console.log("Again! works both ways");
//     console.log(e);
// }

// user1 = await userData.unblockUser(user1._id, user2._id);

// lets test posts!

console.log("...and writing some posts...");

let firstPost = await postData.createPost(
    user1._id,
    {},
    "Hello, world! This is my first post!"
);
user1 = await userData.getUser(user1._id);

// console.log(user1); // should include a post id
// console.log(await postData.getPost(firstPost._id)); // testing getPost

await new Promise((resolve) => setTimeout(resolve, 5000)); // getting sleepy, 5 secs

let nextPost = await postData.createPost(
    user1._id,
    {},
    "Hello again! This is my second post. Better than the first"
);

await new Promise((resolve) => setTimeout(resolve, 5000));

firstPost = await postData.updatePost(
    firstPost._id,
    "I updated this post. The update time should be after that of my second post"
);

let emmaPost1 = await postData.createPost(user2._id, {}, "Hello from Emma!");

await new Promise((resolve) => setTimeout(resolve, 5000));

let justinPost = await postData.createPost(user4._id, {}, "Hello from Justin!");

await new Promise((resolve) => setTimeout(resolve, 5000));

let emmaPost2 = await postData.createPost(
    user2._id,
    {},
    "This is another post from Emma. What's up??"
);

// console.log(nextPost);
// console.log(firstPost);

// await postData.deletePost(nextPost._id); // delete a single post, should not be in users post data
// user1 = await userData.getUser(user1._id);

// await userData.deleteUser(user1._id); // user1 should disappear from database, along with all posts

console.log("All done, database ready!");

// console.log(await postData.generateFeed(user1._id));

await closeConnection();

/**
 * at this point, we should have the following users and friend relations in the database:
 *
 * const user1 = { username: "jgraham5", friends: ["ehodor", "jduran"], public: true }
 * const user2 = { username: "ehodor", friends: ["jgraham5"], public: true }
 * const user4 = { username: "jduran", friends: ["jgraham5"], public: false }
 *
 */
