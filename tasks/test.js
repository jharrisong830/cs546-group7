import { dbConnection, closeConnection } from "../config/mongoConnection.js";

import { userData, postData } from "../data/index.js";


let justinMessage = await userData.createMessage("66294ad654cc54b54c72f235", "66294ada54cc54b54c72f236", "Hello Test Message!!!!!!!")


try {

    justinMessage();

} catch (e) {

}