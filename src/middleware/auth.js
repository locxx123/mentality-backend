import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { baseResponse } from "../config/response.js";

const authMiddleware = async (req, res, next) => {
    try {
        // Đọc accessToken từ cookie
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        // Nếu không có cả accessToken và refreshToken
        if (!accessToken && !refreshToken) {
            return baseResponse(res, {
                success: false,
                statusCode: 401,
                msg: "Bạn chưa đăng nhập",
            });
        }

        let decoded;
        let user;

        // Kiểm tra accessToken trước
        if (accessToken) {
            try {
                // Verify accessToken
                decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                
                // Tìm user theo userId từ token
                user = await User.findById(decoded.userId);
                
                if (!user) {
                    return baseResponse(res, {
                        success: false,
                        statusCode: 401,
                        msg: "Người dùng không tồn tại",
                    });
                }

                // AccessToken còn hạn, gắn user vào request
                req.user = user;
                return next();
            } catch (error) {
                // Nếu accessToken hết hạn hoặc không hợp lệ
                if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                    // Tiếp tục kiểm tra refreshToken
                } else {
                    throw error;
                }
            }
        }

        // Nếu accessToken hết hạn hoặc không có, kiểm tra refreshToken
        if (refreshToken) {
            try {
                // Verify refreshToken
                decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                
                // Kiểm tra type của token
                if (decoded.type !== 'refresh') {
                    return baseResponse(res, {
                        success: false,
                        statusCode: 401,
                        msg: "Token không hợp lệ",
                    });
                }

                // Tìm user theo userId từ refreshToken
                user = await User.findById(decoded.userId);
                
                if (!user) {
                    return baseResponse(res, {
                        success: false,
                        statusCode: 401,
                        msg: "Người dùng không tồn tại",
                    });
                }

                // RefreshToken còn hạn, tạo accessToken mới
                const newAccessToken = jwt.sign(
                    { userId: user._id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
                );

                // Set accessToken mới vào cookie
                const isProduction = process.env.NODE_ENV === 'production';
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: 'lax',
                    maxAge: 15 * 60 * 1000 // 15 phút
                });

                // Gắn user vào request
                req.user = user;
                return next();
            } catch (error) {
                // RefreshToken cũng hết hạn hoặc không hợp lệ
                if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                    return baseResponse(res, {
                        success: false,
                        statusCode: 401,
                        msg: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
                    });
                } else {
                    throw error;
                }
            }
        }

        // Nếu không có cả accessToken và refreshToken hợp lệ
        return baseResponse(res, {
            success: false,
            statusCode: 401,
            msg: "Bạn chưa đăng nhập",
        });

    } catch (error) {
        console.error('Auth middleware error:', error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "Lỗi xác thực",
        });
    }
};

export default authMiddleware;