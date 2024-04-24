import {Router} from 'express';
const router = Router();
import helpers from "../helpers/validation.js";
import {userData } from '../data/index.js';

router
    .route('/')
    .get(async (req, res) => {
        try {
            res.render('search', {});
        } catch {
            res.status(500).json({error: e});
        }
    });

router
    .route('/search')
    .post(async (req, res) => {
        const searchTerm = req.body.searchText;
        const searchType = req.body.searchType;
        try {
            searchTerm = helpers.returnValidString(searchTerm).toLowerCase();
            searchType = helpers.returnValidString(searchType);
            if (searchType == "users") {
                const userSearch = await findByUsername(searchTerm);
                if (!userSearch) {
                    throw "No user found with that name";
                } else {
                    res.redirect(`user/${searchTerm}`);
                }
            } else {
                //implement playlist search !!!
            }
        } catch {
            res.status(500).json({error: e});
        }
    })

export default router;