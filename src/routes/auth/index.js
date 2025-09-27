const express = require("express");
const router = express.Router();
const validate = require("@src/middleware/validate");

const { sendOtp } = require("@src/controllers/auth/send-otp");
const { sendOTPSchema, verifyOTPSchema, loginSchema } = require("@src/validations/authen");
const { verifyOtp } = require("@src/controllers/auth/verifyOtp");
const { login } = require("@src/controllers/auth/login");




router.post("/auth/send-otp", validate(sendOTPSchema), sendOtp);
router.post("/auth/verify-otp", validate(verifyOTPSchema), verifyOtp);
router.post("/auth/login", validate(loginSchema), login);

module.exports = router;
