/**
 * populate the database with test data
 */

import { urlencoded } from "express";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";

import { userData, postData } from "../data/index.js";

const db = await dbConnection();

console.log("Dropping database entries...");

await db.dropDatabase();

// testing registration of valid users

console.log("Creating users...");

let michaelDevious = await userData.registerUser(
    "deviousTweeter",
    "deVious420*",
    "2000-06-09",
    true,
    "Michael Devious"
);

let johnGraham = await userData.registerUser(
    "jharrisong830",
    "passworD123*",
    "2003-08-30",
    true,
    "John Graham"
);

let emmaHodor = await userData.registerUser(
    "ehodor",
    "1234emmaH&",
    "2003-02-10" // the rest of the fields default to true and null, not needed!
);

let justinDuran = await userData.registerUser(
    "jduran",
    "Wustin*456",
    "2002-04-20",
    false,
    "Justin"
);

let ramsesPeralta = await userData.registerUser(
    "rperalt1",
    "iobotomY-69",
    "2004-06-02",
    true,
    "TheRam"
);

let rebeccaAn = await userData.registerUser(
    "rebeccaan3",
    "Password*96",
    "2003-02-01",
    false,
    "Rebecca An"
);

console.log("Making friends along the way...");

michaelDevious = await userData.addFriend(michaelDevious._id, johnGraham._id);
michaelDevious = await userData.addFriend(michaelDevious._id, emmaHodor._id);
michaelDevious = await userData.addFriend(michaelDevious._id, justinDuran._id);

johnGraham = await userData.addFriend(johnGraham._id, michaelDevious._id);
johnGraham = await userData.addFriend(johnGraham._id, emmaHodor._id);
johnGraham = await userData.addFriend(johnGraham._id, justinDuran._id);
johnGraham = await userData.addFriend(johnGraham._id, rebeccaAn._id);
johnGraham = await userData.addFriend(johnGraham._id, ramsesPeralta._id);

emmaHodor = await userData.addFriend(emmaHodor._id, michaelDevious._id);
emmaHodor = await userData.addFriend(emmaHodor._id, johnGraham._id);
emmaHodor = await userData.addFriend(emmaHodor._id, justinDuran._id);
emmaHodor = await userData.blockUser(emmaHodor._id, ramsesPeralta._id); // blocking starts here

justinDuran = await userData.addFriend(justinDuran._id, michaelDevious._id);
justinDuran = await userData.addFriend(justinDuran._id, johnGraham._id);
justinDuran = await userData.addFriend(justinDuran._id, emmaHodor._id);

ramsesPeralta = await userData.addFriend(ramsesPeralta._id, johnGraham._id);
ramsesPeralta = await userData.addFriend(ramsesPeralta._id, rebeccaAn._id);

rebeccaAn = await userData.addFriend(rebeccaAn._id, johnGraham._id);
rebeccaAn = await userData.addFriend(rebeccaAn._id, ramsesPeralta._id);
rebeccaAn = await userData.blockUser(rebeccaAn._id, michaelDevious._id); // blocking starts here

// lets test friend requests!
console.log("looking for more friends too...");
michaelDevious = await userData.addFriendRequest(
    michaelDevious._id,
    ramsesPeralta._id
);

justinDuran = await userData.addFriendRequest(justinDuran._id, rebeccaAn._id);
justinDuran = await userData.addFriendRequest(
    justinDuran._id,
    ramsesPeralta._id
);

ramsesPeralta = await userData.addFriendRequest(
    ramsesPeralta._id,
    michaelDevious._id
);
//ramsesPeralta = await userData.addFriendRequest(ramsesPeralta._id, emmaHodor._id); //checks to see if you can send a friend request to a blocked user
ramsesPeralta = await userData.addFriendRequest(
    ramsesPeralta._id,
    justinDuran._id
);

rebeccaAn = await userData.addFriendRequest(rebeccaAn._id, justinDuran._id);

// lets test posts!

console.log("...and writing some posts...");

let johnPost1Music = {
    _id: "2aGVQddkbCISYvn4XJVpN1",
    platform: "SP",
    type: "playlist",
    name: "Kendrick Stan",
    platformURL: "https://open.spotify.com/playlist/2aGVQddkbCISYvn4XJVpN1",
    tracks: [
        {
            _id: "77DRzu7ERs0TX3roZcre7Q",
            platform: "SP",
            type: "track",
            isrc: "USUG12402839",
            name: "euphoria",
            artists: ["Kendrick Lamar"],
            platformURL:
                "https://open.spotify.com/track/77DRzu7ERs0TX3roZcre7Q",
            albumId: "32bR4LcEc1PvJEhaKoo4ZN"
        },
        {
            _id: "7uWVT3UkCAZyANvv0bdyQn",
            platform: "SP",
            type: "track",
            isrc: "USUM71502496",
            name: "These Walls",
            artists: ["Kendrick Lamar", "Bilal", "Anna Wise", "Thundercat"],
            platformURL:
                "https://open.spotify.com/track/7uWVT3UkCAZyANvv0bdyQn",
            albumId: "7ycBtnsMtyVbbwTfJwRjSP"
        },
        {
            _id: "6HZILIRieu8S0iqY8kIKhj",
            platform: "SP",
            type: "track",
            isrc: "USUM71703079",
            name: "DNA.",
            artists: ["Kendrick Lamar"],
            platformURL:
                "https://open.spotify.com/track/6HZILIRieu8S0iqY8kIKhj",
            albumId: "4eLPsYPBmXABThSJ821sqY"
        },
        {
            _id: "4S8PxReB1UiDR2F5x1lyIR",
            platform: "SP",
            type: "track",
            isrc: "USUG12400909",
            name: "meet the grahams",
            artists: ["Kendrick Lamar"],
            platformURL:
                "https://open.spotify.com/track/4S8PxReB1UiDR2F5x1lyIR",
            albumId: "5PGH88Cwual1Nj8d2RsKP0"
        }
    ],
    ratings: []
};
let johnPost1 = await postData.createPost(
    johnGraham._id,
    johnPost1Music,
    "Here's my new playlist, inspired by the beef that's going on. It's funny bc my last name is Graham lmaooo",
    ["hip-hop", "", ""]
);
johnGraham = await userData.getUser(johnGraham._id);

await new Promise((resolve) => setTimeout(resolve, 5000)); // getting sleepy, 5 secs

let johnPost2Music = {
    _id: "1jZrlerU1ZWEI7oDPtHPGx",
    platform: "SP",
    type: "track",
    isrc: "USAT22102113",
    name: "MESS U MADE",
    artists: ["MICHELLE"],
    platformURL: "https://open.spotify.com/track/1jZrlerU1ZWEI7oDPtHPGx",
    albumId: "0DNz0XsG6B1Vz1CcbuIsov"
};
let johnPost2 = await postData.createPost(
    johnGraham._id,
    johnPost2Music,
    "One of my all time favorites, so glad I found this band!",
    ["", "", ""]
);
johnGraham = await userData.getUser(johnGraham._id);

await new Promise((resolve) => setTimeout(resolve, 5000));

johnPost1 = await postData.updatePost(
    johnPost1._id,
    "Just wanted to update by saying I am not related to Drake, despite my last name. I want nothing to do with him.   " +
        johnPost1.textContent
);

let emmaComment1 = await postData.commentPost(
    johnPost2._id,
    emmaHodor._id,
    "Not a fan tbh, kinda mid"
);
emmaHodor = await userData.getUser(emmaHodor._id);

await new Promise((resolve) => setTimeout(resolve, 5000));

let emmaPost1Music = {
    _id: "5V729UqvhwNOcMejx0m55I",
    platform: "SP",
    type: "album",
    name: "NewJeans 'Super Shy'",
    artists: ["NewJeans"],
    platformURL: "https://open.spotify.com/album/5V729UqvhwNOcMejx0m55I",
    tracks: []
};
let emmaPost1 = await postData.createPost(
    emmaHodor._id,
    emmaPost1Music,
    "My name is emma, and i LOVE kpop!!!",
    ["", "", ""]
);
emmaHodor = await userData.getUser(emmaHodor._id);

console.log("All done, database ready!");

await closeConnection();
