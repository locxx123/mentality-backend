const express = require("express");
const router = express.Router();
const validate = require("@src/middleware/validate");

const { searchSchema } = require("@src/validations/user");
const { search } = require("@src/controllers/user/search");
const authMiddleware = require("@src/middleware/auth");



router.get("/search", authMiddleware, validate(searchSchema), search);

module.exports = router;
