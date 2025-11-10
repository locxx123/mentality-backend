const express = require("express");
const router = express.Router();
const validate = require("@src/middleware/validate");
const authMiddleware = require("@src/middleware/auth");

const { updateProfileSchema } = require("@src/validations/user");
const { updateProfile } = require("@src/controllers/user/update-profile");
const { getProfile } = require("@src/controllers/auth/me");

router.get("/auth/me", authMiddleware, getProfile);
router.put("/user/profile", authMiddleware, validate(updateProfileSchema), updateProfile);

module.exports = router;

