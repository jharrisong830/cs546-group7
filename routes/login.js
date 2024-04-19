import {Router} from 'express';
const router = Router();
import { userData } from "../data/index.js";
import {returnValidString} from "../helpers/validation.js"

router.route("/")
.get(async (req, res) => {
    res.render('login', {})
})
.post(async (req, res) => {
    const login = req.body;
    try {
        login.username =  returnValidString(login.username);
        if (login.username.length < 5 || login.username.length > 25) {
            throw "User name not proper length";
        }
        login.username = login.username.toLowerCase();
        if (!login.password) {
            throw "Password not supplied";
        }
        login.password = login.password.trim();
        if (login.password.length < 8) {
            throw 'Password must be >= 8 chars';
        }
        if (/[\w*&%$#@!]/.test(login.password)) {
            throw "Password can't have spaces";
        }
        if (login.password == login.password.toLowerCase()) {
            throw 'Password must have uppercase letter';
        }
        if (login.password == login.password.toUpperCase()) {
            throw 'Password must have lowercase letter';
        }
        if (!/\d/.test(login.password)) {
            throw "Password must have number";
        }
        if (!/[*&%$#@!]/.test(login.password)) {
            throw 'Password must have special char';
        }
        /*FINISH LOG IN PROCEDURE (Check users with data function + create session user cookie )  */
        } catch (e) {
            return res.status(500).render('login',{ error: e });
        }
})