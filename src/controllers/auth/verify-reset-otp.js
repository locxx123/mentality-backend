import { baseResponse } from "../../config/response.js";
import Otp from "../../models/Otp.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

const PASSWORD_RESET_TOKEN_EXPIRES_IN = process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || "10m";

const verifyResetOtp = async (req, res) => {
    try {
        const { otp, email } = req.body;

        const cleanOtp = otp.trim();
        const cleanEmail = email.trim();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Email chưa được đăng ký",
            });
        }

        const otpRecord = await Otp.findOne({
            email: cleanEmail,
            otp: cleanOtp,
            is_used: false,
            expires_at: { $gt: new Date() }
        });

        if (!otpRecord) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "OTP không hợp lệ hoặc đã hết hạn",
            });
        }

        otpRecord.is_used = true;
        await otpRecord.save();

        const resetToken = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                type: "password-reset"
            },
            process.env.JWT_SECRET,
            { expiresIn: PASSWORD_RESET_TOKEN_EXPIRES_IN }
        );

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                resetToken
            },
            msg: "Xác thực OTP thành công",
        });
    } catch (error) {
        console.error("verifyResetOtp error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 400,
            msg: "Xác thực OTP thất bại"
        });
    }
};

export { verifyResetOtp };


