const { baseResponse } = require("@src/config/response");
const Otp = require("@src/models/Otp");
const User = require("@src/models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const verifyOtp = async (req, res) => {
    try {
        const { otp, fullName, email, phone, password } = req.body;

        const cleanOtp = otp.trim();
        const cleanEmail = email.trim();


        // Parallel check email & existing OTP
        const [existingUser, isVerifyOtp] = await Promise.all([
            User.findOne({ email }),
            Otp.findOne({
                email, otp: cleanOtp, is_used: false
            })
        ]);

        if (existingUser) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "EMAIL_EXISTED",
            });
        }

        if (!isVerifyOtp) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "OTP_INVALID",
            });
        }
        const sessionId = crypto.randomBytes(16).toString("hex");
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            fullName,
            email: cleanEmail,
            phone,
            password: hashedPassword,
            sessionId,
            avatar: `https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png`,
            isVerified: true,
        });
        await user.save();


        // Xóa OTP cũ bất đồng bộ (không block response)
        Otp.deleteMany({
            email,
            $or: [{ is_used: true }]
        }).catch(err => console.error("Delete old OTP error:", err));

        // Trả response ngay lập tức
        baseResponse(res, {
            success: true,
            statusCode: 201,
            data: user,
            msg: "VERIFY_OTP_SUCCESS",
        });

    } catch (error) {
        console.error("sendOtp error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 400,
            msg: "OTP_SEND_FAILED"
        });
    }
};

module.exports = { verifyOtp };
