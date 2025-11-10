const User = require("@models/User");
const { baseResponse } = require("@src/config/response");

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, age, gender, occupation, bio, avatar } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "USER_NOT_FOUND",
            });
        }

        if (fullName) user.fullName = fullName;
        if (age !== undefined) user.age = age;
        if (gender) user.gender = gender;
        if (occupation !== undefined) user.occupation = occupation;
        if (bio !== undefined) user.bio = bio;
        if (avatar) user.avatar = avatar;

        await user.save();

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: user,
            msg: "PROFILE_UPDATED_SUCCESS",
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { updateProfile };

