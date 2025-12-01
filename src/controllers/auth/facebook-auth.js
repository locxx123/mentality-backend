import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from '../../config/cookie.js';

// Cấu hình Facebook Strategy
passport.use('facebook', new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'email', 'picture.type(large)']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Facebook profile structure
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const facebookId = profile.id;
        const displayName = profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName;
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        if (!email) {
            return done(new Error('Facebook account không có email. Vui lòng cung cấp email trong tài khoản Facebook.'), null);
        }

        // Tìm user theo facebookId hoặc email
        let user = await User.findOne({ 
            $or: [
                { facebookId: facebookId },
                { email: email }
            ]
        });

        if (user) {
            // Nếu user tồn tại nhưng chưa có facebookId, cập nhật
            if (!user.facebookId) {
                user.facebookId = facebookId;
                if (avatar && !user.avatar) {
                    user.avatar = avatar;
                }
                await user.save();
            }
            return done(null, user);
        } else {
            // Tạo user mới
            user = new User({
                facebookId: facebookId,
                email: email,
                fullName: displayName,
                avatar: avatar,
                isVerified: true, // Facebook đã verify email
            });
            await user.save();
            return done(null, user);
        }
    } catch (error) {
        console.error('Facebook OAuth error:', error);
        return done(error, null);
    }
}));

// Initiate Facebook OAuth
const facebookAuth = (req, res, next) => {
    passport.authenticate('facebook', {
        scope: ['email']
    })(req, res, next);
};

// Handle Facebook OAuth callback
const facebookCallback = async (req, res, next) => {
    passport.authenticate('facebook', { session: false }, async (err, user, info) => {
        try {
            if (err || !user) {
                // Redirect to frontend with error
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/authen/login?error=facebook_auth_failed`);
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
            return res.redirect(`${frontendUrl}/dashboard?facebook_auth=success`);
        } catch (error) {
            console.error('Facebook callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/authen/login?error=facebook_auth_failed`);
        }
    })(req, res, next);
};

export { facebookAuth, facebookCallback };

