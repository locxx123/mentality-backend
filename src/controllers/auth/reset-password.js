import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { baseResponse } from "../../config/response.js";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "../../config/cookie.js";

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Thiếu thông tin đặt lại mật khẩu",
            });
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Token không hợp lệ hoặc đã hết hạn",
            });
        }

        if (payload.type !== "password-reset") {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Token không hợp lệ",
            });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "Người dùng không tồn tại",
            });
        }

        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(password, salt);
        user.isVerified = true;
        await user.save();

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

        res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
        res.cookie('refreshToken', refreshTokenValue, getRefreshTokenCookieOptions());

        const { id, createdAt, updatedAt, isVerified, ...userData } = user.toJSON();

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                user: userData
            },
            msg: "Đặt lại mật khẩu thành công",
        });
    } catch (error) {
        console.error("resetPassword error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 400,
            msg: "Đặt lại mật khẩu thất bại"
        });
    }
};

export { resetPassword };


