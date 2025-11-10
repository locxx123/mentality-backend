const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('@models/User');
const baseResponse = require('@src/utils/response');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: 'Email và mật khẩu là bắt buộc'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: 'Email không tồn tại'
            });
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return baseResponse(res, {
                success: false,
                statusCode: 401,
                msg: 'Mật khẩu không chính xác'
            });
        }


        // Tạo access token và refresh token
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        const refreshTokenValue = jwt.sign(
            { userId: user._id, email: user.email, type: 'refresh' },
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

        // Trả thông tin user thôi, không trả token
        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                user: {
                    id: user._id,
                    full_name: user.full_name,
                    phone_number: user.phone_number,
                    profile: user.profile
                }
            },
            msg: 'Đăng nhập thành công'
        });

    } catch (error) {
        console.error('Login error:', error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: 'Lỗi server, vui lòng thử lại sau'
        });
    }
};

module.exports = {
    login
};
