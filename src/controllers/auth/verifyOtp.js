import { baseResponse } from "../../config/response.js";
import Otp from "../../models/Otp.js";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const verifyOtp = async (req, res) => {
    try {
        const { otp, fullName, email, password } = req.body;

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
                msg: "Email đã tồn tại",
            });
        }

        if (!isVerifyOtp) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "OTP không hợp lệ",
            });
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            fullName,
            email: cleanEmail,
            password: hashedPassword,
            avatar: `https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png`,
            isVerified: true,
        });
        await user.save();

        // Đánh dấu OTP đã sử dụng
        isVerifyOtp.is_used = true;
        await isVerifyOtp.save();

        // Tạo access token và refresh token
        const accessToken = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        const refreshTokenValue = jwt.sign(
            { userId: user._id.toString(), email: user.email, type: 'refresh' },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        // Gửi token qua cookie
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 phút
        });

        res.cookie('refreshToken', refreshTokenValue, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        // Trả thông tin user, không trả token
        return baseResponse(res, {
            success: true,
            statusCode: 201,
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    profile: user.profile
                }
            },
            msg: "Xác thực thành công",
        });

    } catch (error) {
        console.error("sendOtp error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 400,
            msg: "Xác thực thất bại"
        });
    }
};

export { verifyOtp };
