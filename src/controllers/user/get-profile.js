const User = require("@models/User");
const { baseResponse } = require("@src/config/response");

const getProfile = async (req, res) => {
    try {
        const user = req.user;

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: user,
            msg: "GET_PROFILE_SUCCESS",
        });

    } catch (error) {
        console.error("Get profile error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { getProfile };

