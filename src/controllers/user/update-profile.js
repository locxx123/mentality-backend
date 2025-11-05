const User = require("@models/User");
const { baseResponse } = require("@src/config/response");

const updateProfile = async (req, res) => {
    try {
        const currentUser = req.user;
        const { fullName, avatar, bio } = req.body;

        // Tạo object chứa các trường cần update
        const updateFields = {};
        
        if (fullName !== undefined) {
            updateFields.fullName = fullName;
        }
        
        if (avatar !== undefined) {
            updateFields.avatar = avatar;
        }

        if (bio !== undefined) {
            updateFields.bio = bio;
        }

        // Cập nhật thông tin user
        const updatedUser = await User.findByIdAndUpdate(
            currentUser._id,
            { $set: updateFields },
            { new: true }
        );

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: "UPDATE_PROFILE_SUCCESS",
            data: updatedUser
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR"
        });
    }
};

module.exports = { updateProfile };