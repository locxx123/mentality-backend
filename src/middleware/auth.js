const jwt = require("jsonwebtoken");
const User = require("@models/User");
const { baseResponse } = require("@src/config/response");

const authMiddleware = async (req, res, next) => {
    try {
        let sessionId = "";
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            sessionId = authHeader.replace('Bearer ', '').trim();
        }

        // Kiểm tra có sessionId không
        if (!sessionId) {
            return baseResponse(res, {
                success: false,
                statusCode: 401,
                msg: "Bạn chưa đăng nhập",
            });
        }

        // Tìm user theo sessionId
        const user = await User.findBySessionId(sessionId);

        if (!user) {
            return baseResponse(res, {
                success: false,
                statusCode: 401,
                msg: "Phiên đăng nhập không hợp lệ",
            });
        }

        // Gắn thông tin user vào req
        req.user = user;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "Lỗi xác thực",
        });
    }
};

module.exports = authMiddleware;