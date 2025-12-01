/**
 * Cookie configuration và helper functions
 */

/**
 * Lấy base options cho cookie
 * @returns {Object} Cookie base options
 */
export const getCookieBaseOptions = () => {
    const isHttps = process.env.PROTOCOL === 'https';
    return {
        httpOnly: true,
        secure: isHttps,                 // chỉ true khi HTTPS
        sameSite: isHttps ? 'none' : 'lax',
        path: '/',
    };
};

/**
 * Lấy options cho access token cookie
 * @returns {Object} Access token cookie options
 */
export const getAccessTokenCookieOptions = () => {
    return {
        ...getCookieBaseOptions(),
        maxAge: 15 * 60 * 1000 // 15 phút
    };
};

/**
 * Lấy options cho refresh token cookie
 * @returns {Object} Refresh token cookie options
 */
export const getRefreshTokenCookieOptions = () => {
    return {
        ...getCookieBaseOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    };
};

