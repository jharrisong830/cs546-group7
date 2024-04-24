
import { Router } from "express";
import { userData } from "../data/index.js";
import vld from "../helpers/validation.js";
import errorMessage from "../helpers/error.js";
import { users, posts } from "../config/mongoCollections.js";


const router = Router();

router
    .route("/")
    .get(async (req, res) => {
        res.render("profileSettings", { title: "Change settings" });
    })
    .post(async (req, res) => {
        const changedData = req.body;
        const updates ={};
        try {
            if (
                changedData.publicProfile == "public" ||
                changed.publicProfile == "private"
            ) {
                updates[publicProfile] = changedData.publicProfile;
            }
            if (changedData.changeDisplay.length > 0) {
                changedData.changeDisplay = vld.returnValidString(changedData.changeDisplay);
                updates[name] = changedData.changeDisplay;
                }
            if (changedData.changeUsername.length > 0) {
                updates[username] = changedData.changeUsername;
            }
            if (changedData.changePassword.length > 0) {
                updates[password] = changedData.changePassword;
            }
            const updated = await userData.updateUser(req.session.user._id, updates);
            return updated;
            } catch {
                return res.status(400).json({ error: e });
            }
        }
    )