import express from "express";
import validate from "../../middleware/validate.js";
import { sendOtp } from "../../controllers/auth/send-otp.js";
import { sendOTPSchema, verifyOTPSchema, loginSchema, sendResetOTPSchema, verifyResetOTPSchema, resetPasswordSchema } from "../../validations/authen/index.js";
import { verifyOtp } from "../../controllers/auth/verifyOtp.js";
import { login } from "../../controllers/auth/login.js";
import { googleAuth } from "../../controllers/auth/google-auth.js";
import { facebookAuth } from "../../controllers/auth/facebook-auth.js";
import { sendResetOtp } from "../../controllers/auth/send-reset-otp.js";
import { verifyResetOtp } from "../../controllers/auth/verify-reset-otp.js";
import { resetPassword } from "../../controllers/auth/reset-password.js";

const router = express.Router();

router.post("/auth/send-otp", validate(sendOTPSchema), sendOtp);
router.post("/auth/verify-otp", validate(verifyOTPSchema), verifyOtp);
router.post("/auth/forgot-password/send-otp", validate(sendResetOTPSchema), sendResetOtp);
router.post("/auth/forgot-password/verify-otp", validate(verifyResetOTPSchema), verifyResetOtp);
router.post("/auth/forgot-password/reset", validate(resetPasswordSchema), resetPassword);
router.post("/auth/login", validate(loginSchema), login);
router.get("/auth/google", googleAuth);
router.get("/auth/facebook", facebookAuth);
// Note: /auth/google/callback and /auth/facebook/callback are handled directly in app.js to match OAuth provider configs

export default router;
