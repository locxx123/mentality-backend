import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import baseResponse from '../../utils/response.js';

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
        const cookieBaseOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
        };

        res.cookie('accessToken', accessToken, {
            ...cookieBaseOptions,
            maxAge: 15 * 60 * 1000 // 15 phút
        });

        res.cookie('refreshToken', refreshTokenValue, {
            ...cookieBaseOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        const {id, createdAt, updatedAt,isVerified, ...userData} = user.toJSON();
        // Trả thông tin user thôi, không trả token
        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                user: userData,
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

export { login };
