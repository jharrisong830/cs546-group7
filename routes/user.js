import { Router } from "express";
import { userData, postData } from "../data/index.js";
import vld from "../helpers/validation.js";
import xss from "xss";
import { post } from "ajax";

const router = Router();

router
    .route("/:username")
    .get(async (req, res) => {
        if (!req.session.user) {
            return res.status(401).render("error", {
                title: "Error",
                errmsg: "401: You need to be logged in to access this page."
            });
        }
        try {
            req.params.username = vld
                .returnValidString(req.params.username)
                .toLowerCase(); // get the username as lowercase
            const isCurrent = req.session.user.username === req.params.username; // we are viewing the current user's page if the usernames match

            const userId = await userData.findByUsername(req.params.username); // get the id of the requested user

            if (!userId) {
                return res.status(404).render("error", {
                    title: "Error",
                    errmsg: `404: user '${req.params.username}' was not found`
                });
            }
            const usr = await userData.getUser(userId);
            const currUser = await userData.getUser(req.session.user._id); // get friend ids as strings
            const currUserFriends = currUser.friends.map((fr) => fr.toString());
            let isFriend = currUserFriends.includes(userId.toString());

            if (req.query.removeFriend === "true" && isFriend) {
                await userData.removeFriend(req.session.user._id, userId);
                const updatedCurrUser = await userData.getUser(
                    req.session.user._id
                );
                const updatedCurrUserFriends = updatedCurrUser.friends.map(
                    (fr) => fr.toString()
                );
                isFriend = updatedCurrUserFriends.includes(userId.toString());
                return res.redirect(`/user/${req.params.username}`);
            }

            console.log(usr);
            return res.render("user", {
                currentUsername: req.session.user.username,
                title: usr.username,
                hasName: usr.name !== null,
                isCurrent: isCurrent,
                isFriend: isFriend,
                showProfile:
                    usr.publicProfile ||
                    isCurrent ||
                    currUserFriends.includes(userId.toString()), // we will show content if profile is public or if this is the current user (false when private and not current user), or if the requested user is in the friends list of the current user
                user: usr,
                commentArray: usr.comments
            });
        } catch (e) {
            return res
                .status(404)
                .render("error", { title: "Error", errmsg: e });
        }
    })
    .post(async (req, res) => {
        if (!req.session.user) {
            return res.status(401).render("error", {
                title: "Error",
                errmsg: "401: You need to be logged in to send a friend request."
            });
        }
        try {
            let friendRequest = req.body;
            let cleanRequester = xss(friendRequest.requester),
                cleanRequested = xss(friendRequest.requested);
            let requesterId = await userData.findByUsername(cleanRequester);
            let requestedId = await userData.findByUsername(cleanRequested);

            let requestSent = await userData.addFriendRequest(
                requestedId,
                requesterId
            );

            return res.redirect(`/user/${friendRequest.requested}`);
        } catch (e) {
            return res.status(500).render("error", {
                title: "Error",
                errmsg: "Failed to send friend request"
            });
        }
    });

router
    .route("/:username/messages")
    .get(async (req, res) => {
        if (!req.session.user) {
            return res.status(401).render("error", {
                title: "Error",
                errmsg: "401: You need to be logged in to access this page."
            });
        }

        if (req.session.user.username !== req.params.username) {
            return res.status(403).render("error", {
                title: "Error",
                errmsg: "403: You are not authorized to access this page."
            });
        }

        try {
            const user = req.params.username;
            let messages = await userData.getMessages(user);

            console.log(messages);
            return res.render("messaging", {
                title: "Messages",
                messages: messages,
                recipientUsername: user
            });
        } catch (e) {
            return res
                .status(404)
                .render("error", { title: "Error", errmsg: e });
        }
    })
    .post(async (req, res) => {
        if (!req.session.user) {
            return res.status(401).render("error", {
                title: "Error",
                errmsg: "401: You need to be logged in to send a message."
            });
        }
        try {
            const senderUsername = req.session.user.username;
            const recipientUsername = xss(req.body.username);
            const messageContent = xss(req.body.message);

            if (senderUsername === recipientUsername) {
                return res.status(403).render("error", {
                    title: "Error",
                    errmsg: "403: You cannot send a message to yourself."
                });
            }

            const newMessage = await userData.createMessage(
                messageContent,
                senderUsername,
                recipientUsername
            );

            res.redirect(`/user/${senderUsername}/messages`);
        } catch (e) {
            console.log(e);
            return res.status(500).render("error", {
                title: "Error",
                errmsg: e
            });
        }
    });
router
    .route("/:username/edit")
    .get(async (req, res) => {
        if (!req.session.user) {
            return res.status(401).render("error", {
                title: "Error",
                errmsg: "401: You need to be logged in to access this page."
            });
        }

        try {
            req.params.username = vld
                .returnValidString(req.params.username)
                .toLowerCase(); // get the username as lowercase
            const isCurrent = req.session.user.username === req.params.username; // we are viewing the current user's page if the usernames match

            if (!isCurrent)
                return res.status(403).render("error", {
                    title: "Error",
                    errmsg: "403: You are not allowed to access this page."
                }); // render error if a user tries to edit another user's page

            const userId = await userData.findByUsername(req.params.username); // get the id of the requested user

            if (!userId) {
                return res.status(404).render("error", {
                    title: "Error",
                    errmsg: `404: user '${req.params.username}' was not found`
                });
            }

            const usr = await userData.getUser(userId);

            return res.render("userEdit", {
                title: "Edit User Profile",
                hasName: usr.name !== null,
                user: usr
            });
        } catch (e) {
            return res
                .status(404)
                .render("error", { title: "Error", errmsg: e });
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
            req.params.username = vld
                .returnValidString(req.params.username)
                .toLowerCase(); // get the username as lowercase
            const isCurrent = req.session.user.username === req.params.username; // we are viewing the current user's page if the usernames match

            if (!isCurrent)
                return res.status(403).render("error", {
                    title: "Error",
                    errmsg: "403: You are not allowed to access this page."
                }); // render error if a user tries to edit another user's page

            const userId = await userData.findByUsername(req.params.username); // get the id of the requested user

            if (!userId) {
                return res.status(404).render("error", {
                    title: "Error",
                    errmsg: `404: user '${req.params.username}' was not found`
                });
            }

            let usr = await userData.getUser(userId);

            let updatedFields = req.body;

            if (
                updatedFields.publicProfile !== "public" &&
                updatedFields.publicProfile !== "private"
            ) {
                errorMessage(
                    MOD_NAME,
                    `/user/${req.session.user.username}/edit POST`,
                    "invalid option for public profile"
                );
            }
            if (
                (updatedFields.publicProfile === "public") !==
                usr.publicProfile
            ) {
                usr = await userData.toggleProfileVisibility(usr._id); // toggle the profile visibility, if needed
            }
            delete updatedFields.publicProfile;

            Object.keys(updatedFields).forEach((field) => {
                if (updatedFields[field].trim().length === 0)
                    delete updatedFields[field]; // delete a field if it was left blank
                if (field === "confirmPassword") delete updatedFields[field]; // delete confirm password field (not needed)
            });

            if (Object.keys(updatedFields).length !== 0) {
                usr = await userData.updateUser(usr._id, updatedFields); // pass along the remaining updated fields to be validated/set
            }

            req.session.user = {
                // re-set fields of the current user (username or profile status might have changed)
                _id: usr._id,
                username: usr.username,
                publicProfile: usr.publicProfile,
                name: usr.name
            };

            return res.redirect(`/user/${req.session.user.username}`); // redirect to the user's profile
        } catch (e) {
            return res.render("userEdit", {
                title: "Edit User Profile",
                hasName: req.session.user.name !== null,
                user: req.session.user,
                errmsg: e
            });
        }
    });

router
    .route("/:username/requests")
    .get(async (req, res) => {
        if (!req.session.user) {
            return res.status(401).render("error", {
                title: "Error",
                errmsg: "401: You need to be logged in to access this page."
            });
        }

        try {
            req.params.username = vld
                .returnValidString(req.params.username)
                .toLowerCase(); // get the username as lowercase
            const isCurrent = req.session.user.username === req.params.username; // we are viewing the current user's page if the usernames match

            if (!isCurrent)
                return res.status(403).render("error", {
                    title: "Error",
                    errmsg: "403: You are not allowed to access this page."
                }); // render error if a user tries to edit another user's page

            const userId = await userData.findByUsername(req.params.username); // get the id of the requested user

            if (!userId) {
                return res.status(404).render("error", {
                    title: "Error",
                    errmsg: `404: user '${req.params.username}' was not found`
                });
            }

            const usr = await userData.getUser(userId);

            const requestsList = await userData.getRequests(userId);

            return res.render("requests", {
                title: "View Friend Requests",
                hasName: usr.name !== null,
                user: usr,
                requests: requestsList
            });
        } catch (e) {
            return res
                .status(404)
                .render("error", { title: "Error", errmsg: e });
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
            req.params.username = vld
                .returnValidString(req.params.username)
                .toLowerCase(); // get the username as lowercase
            const isCurrent = req.session.user.username === req.params.username; // we are viewing the current user's page if the usernames match

            if (!isCurrent)
                return res.status(403).render("error", {
                    title: "Error",
                    errmsg: "403: You are not allowed to access this page."
                }); // render error if a user tries to edit another user's page

            const userId = await userData.findByUsername(req.params.username); // get the id of the requested user

            if (!userId) {
                return res.status(404).render("error", {
                    title: "Error",
                    errmsg: `404: user '${req.params.username}' was not found`
                });
            }

            //get input via acceptStatus = req.body;
            //validate to make sure that the input is valid. make sure to validate client side too
            //if accept, then call addFriend function and remove it from the requests list
            //if deny, then remove it from the requests list
            //if '' then do nothing
            let usr = await userData.getUser(userId);

            let friendRequestStatus = req.body; //friendRequestStatus.acceptStatus

            if (
                friendRequestStatus.acceptStatus !== "accept" &&
                friendRequestStatus.acceptStatus !== "decline" &&
                friendRequestStatus.acceptStatus !== ""
            ) {
                errorMessage(
                    MOD_NAME,
                    `/user/${req.session.user.username}/requests POST`,
                    "invalid option for friend request"
                );
            }

            let requesterId = await userData.findByUsername(
                friendRequestStatus.requestx
            ); //handlebar sends over the username of the requester so this will get their id

            if (friendRequestStatus.acceptStatus === "accept") {
                let filler = await userData.addFriend(usr._id, requesterId); // call addFriend on that id, then remove it from the requests list
                filler = await userData.addFriend(requesterId, usr._id);
                filler = await userData.removeFriendRequest(
                    usr._id,
                    requesterId
                );

                //if person a requests person b, but person b is in person a's requests, remove person b from person a's requests
                /*let temp = await userData.getUser(requesterId);
                let incomingRequests = temp.friendRequests;
                console.log(usr._id);

                for (let x in incomingRequests)
                {
                    if (usr._id === incomingRequests[x])
                    {
                        console.log("it goes here lol");
                        filler = await userData.removeFriendRequest(requesterId, usr._id);
                    }
                }*/
            } else if (friendRequestStatus.acceptStatus === "decline") {
                let filler = await userData.removeFriendRequest(
                    usr._id,
                    requesterId
                ); // remove it from the requests list
            } else if (friendRequestStatus.acceptStatus === "") {
                //do nothing
            }

            return res.redirect(`/user/${req.params.username}/requests`); // redirect to the user's requests after accepting/denying someone
        } catch (e) {
            return res.render("requests", {
                title: "View Friend Requests",
                hasName: req.session.user.name !== null,
                user: req.session.user,
                errmsg: e
            });
        }
    });

export default router;
