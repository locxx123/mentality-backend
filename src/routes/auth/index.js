const express = require("express");
const router = express.Router();
const validate = require("@src/middleware/validate");

const { sendOtp } = require("@controllers/auth/send-otp");
const { sendOTPSchema } = require("@src/validations/authen");




router.post("/auth/send-otp", validate(sendOTPSchema), sendOtp);

module.exports = router;
