const User = require("@models/User");
const { baseResponse } = require("@src/config/response");

const addFriend = async (req, res) => {
    try {
        const currentUser = req.user;
        const { phone } = req.body;

        // Tìm user theo phone
        const friendUser = await User.findByPhone(phone);

        if (!friendUser) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "USER_NOT_FOUND",
            });
        }

        // Không cho gửi lời mời tới chính mình
        if (friendUser._id.toString() === currentUser._id.toString()) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "CANNOT_ADD_SELF",
            });
        }

        // Kiểm tra đã là bạn hoặc đã gửi lời mời chưa
        const existed = currentUser.friends?.find(
            (f) => f.userId?.toString() === friendUser._id.toString()
        );
        if (existed) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "ALREADY_INVITED_OR_FRIEND",
            });
        }

        // Thêm lời mời kết bạn
        currentUser.friends.push({
            userId: friendUser._id,
            status: "pending",
            invitedAt: new Date(),
        });
        await currentUser.save();

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: "INVITE_SENT",
        });
    } catch (error) {
        console.error("Add friend error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { addFriend };