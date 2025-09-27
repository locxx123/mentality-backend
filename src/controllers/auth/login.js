const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("@models/User");
const { baseResponse } = require("@src/config/response");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "EMAIL_NOT_FOUND"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "INVALID_PASSWORD"
            });
        }

        // Tạo sessionId mới
        const sessionId = crypto.randomBytes(16).toString("hex");

        // Cập nhật sessionId trong DB (ghi đè cái cũ)
        user.sessionId = sessionId;
        await user.save();

        // Trả về thông tin user + sessionId mới
        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                sessionId
            },
            msg: "LOGIN_SUCCESS"
        });

    } catch (error) {
        console.error("Login error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR"
        });
    }
};

module.exports = {
    login
};
