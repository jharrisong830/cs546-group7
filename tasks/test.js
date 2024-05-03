import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { users, posts, messages } from "../config/mongoCollections.js";
import { createMessage } from "../data/users.js";

import { userData, postData } from "../data/index.js";


let justinMessage = await createMessage("Hello Test Message!!!!!!!", "662965847af0b56c25083593", "662965897af0b56c25083594")


try {

    justinMessage();

} catch (e) {
    console.log(e);
}