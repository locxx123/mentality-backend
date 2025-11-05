const express = require("express");
const router = express.Router();
const validate = require("@src/middleware/validate");
const authMiddleware = require("@src/middleware/auth");

const { searchSchema, addFriendSchema, updateFriendRequestSchema,updateProfileSchema } = require("@src/validations/user");
const { search } = require("@src/controllers/user/search");
const { addFriend } = require("@src/controllers/user/add-friend");
const { getFriendRequests } = require("@src/controllers/user/get-friend-request");
const { getAllFriends } = require("@src/controllers/user/get-all-friend");
const { updateFriendRequest } = require("@src/controllers/user/update-friend-request");
const { updateProfile } = require("@src/controllers/user/update-profile");



router.get("/search", authMiddleware, validate(searchSchema), search);
router.post("/add-friend", authMiddleware, validate(addFriendSchema), addFriend);
router.get("/friends", authMiddleware, getAllFriends);
router.get("/friend-requests", authMiddleware, getFriendRequests);
router.post("/update-friend-request", authMiddleware,validate(updateFriendRequestSchema), updateFriendRequest);
router.post("/update-profile", authMiddleware, validate(updateProfileSchema), updateProfile);
module.exports = router;
