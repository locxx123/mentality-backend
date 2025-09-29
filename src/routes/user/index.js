const express = require("express");
const router = express.Router();
const validate = require("@src/middleware/validate");
const authMiddleware = require("@src/middleware/auth");

const { searchSchema, addFriendSchema } = require("@src/validations/user");
const { search } = require("@src/controllers/user/search");
const { addFriend } = require("@src/controllers/user/add-friend");



router.get("/search", authMiddleware, validate(searchSchema), search);
router.post("/add-friend", authMiddleware, validate(addFriendSchema), addFriend);


module.exports = router;
