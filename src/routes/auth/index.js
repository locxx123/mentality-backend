import express from "express";
import validate from "../../middleware/validate.js";
import { sendOtp } from "../../controllers/auth/send-otp.js";
import { sendOTPSchema, verifyOTPSchema, loginSchema } from "../../validations/authen/index.js";
import { verifyOtp } from "../../controllers/auth/verifyOtp.js";
import { login } from "../../controllers/auth/login.js";

const router = express.Router();

router.post("/auth/send-otp", validate(sendOTPSchema), sendOtp);
router.post("/auth/verify-otp", validate(verifyOTPSchema), verifyOtp);
router.post("/auth/login", validate(loginSchema), login);

export default router;
