import { Router } from "express";
const router = Router();
import helpers from "../helpers/validation.js";
import { userData, postData } from "../data/index.js";
import xss from "xss";

router
    .route("/")
    .get(async (req, res) => {
        if (!req.session.user) {
            return res.status(401).render("error", {
                title: "Error",
                errmsg: "401: You need to be logged in to access this page."
            });
        }
        try {
            res.render("search", { title: "Search" });
        } catch (e) {
            return res.status(500).render("error", {
                title: "Error",
                errmsg: e
            });
        }
    })
    .post(async (req, res) => {
        if (!req.session.user) {
            return res.status(401).render("error", {
                title: "Error",
                errmsg: "401: You need to be logged in to access this page."
            });
        }
        try {
            req.body.searchText = xss(req.body.searchText);
            req.body.searchText = helpers.returnValidString(
                req.body.searchText
            ); // the regex is already case insensitive by default, so lets leave it
            helpers.checkEmptyString(req.body.searchText);

            req.body.searchType = xss(req.body.searchType);
            req.body.searchType = helpers
                .returnValidString(req.body.searchType)
                .toLowerCase();
            helpers.checkEmptyString(req.body.searchType);

            if (req.body.searchType === "users") {
                const results = await userData.searchUsers(req.body.searchText);
                if (results.length === 0) {
                    return res.render("search", {
                        title: "Search",
                        errmsg: `We couldn't find any results for '${req.body.searchText}'. Please try again.`,
                        typeIsUsers: true,
                        searchText: req.body.searchText
                    });
                }
                return res.render("search", {
                    title: "Search Results",
                    results: results,
                    typeIsUsers: true,
                    searchText: req.body.searchText
                });
            } else if (req.body.searchType === "playlists") {
                const results = await postData.searchPlaylists(
                    req.session.user._id,
                    req.body.searchText
                );
                if (results.length === 0) {
                    return res.render("search", {
                        title: "Search",
                        errmsg: `We couldn't find any results for '${req.body.searchText}'. Please try again.`,
                        typeIsPlaylists: true,
                        searchText: req.body.searchText
                    });
                }
                return res.render("search", {
                    title: "Search Results",
                    results: results,
                    typeIsPlaylists: true,
                    searchText: req.body.searchText
                });
            } else if (req.body.searchType === "posts") {
                const results = await postData.searchPosts(
                    req.session.user._id,
                    req.body.searchText
                );
                if (results.length === 0) {
                    return res.render("search", {
                        title: "Search",
                        errmsg: `We couldn't find any results for '${req.body.searchText}'. Please try again.`,
                        typeIsPosts: true,
                        searchText: req.body.searchText
                    });
                }
                return res.render("search", {
                    title: "Search Results",
                    results: results,
                    typeIsPosts: true,
                    searchText: req.body.searchText
                });
            } else {
                return res.status(500).render("error", {
                    title: "Error",
                    errmsg: `Unexpected value for search type '${req.body.searchType}'`
                });
            }
        } catch (e) {
            return res.status(500).render("error", {
                title: "Error",
                errmsg: e
            });
        }
    });

export default router;
