import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from '../../config/cookie.js';
import baseResponse from '../../utils/response.js';

// Cấu hình Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID ,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ,
    callbackURL: process.env.GOOGLE_CALLBACK_URL 
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Tìm user theo googleId hoặc email
        let user = await User.findOne({ 
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
            ]
        });

        if (user) {
            // Nếu user tồn tại nhưng chưa có googleId, cập nhật
            if (!user.googleId) {
                user.googleId = profile.id;
                if (profile.photos && profile.photos[0]) {
                    user.avatar = profile.photos[0].value;
                }
                await user.save();
            }
            return done(null, user);
        } else {
            // Tạo user mới
            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value,
                fullName: profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName,
                avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
                isVerified: true, // Google đã verify email
            });
            await user.save();
            return done(null, user);
        }
    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Initiate Google OAuth
const googleAuth = (req, res, next) => {
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res, next);
};

// Handle Google OAuth callback
const googleCallback = async (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        try {
            if (err || !user) {
                // Redirect to frontend with error
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/authen/login?error=google_auth_failed`);
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

            // Set cookies
            res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
            res.cookie('refreshToken', refreshTokenValue, getRefreshTokenCookieOptions());

            // Redirect to frontend with success
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/dashboard?google_auth=success`);
        } catch (error) {
            console.error('Google callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/authen/login?error=google_auth_failed`);
        }
    })(req, res, next);
};

export { googleAuth, googleCallback };

