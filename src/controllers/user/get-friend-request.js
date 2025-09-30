const FriendRequest = require("@models/FriendRequest");
const { baseResponse } = require("@src/config/response");

const getFriendRequests = async (req, res) => {
    try {
        const currentUser = req.user;

        // Tìm tất cả lời mời kết bạn gửi tới mình, trạng thái pending
        const requests = await FriendRequest.find({
            receiver: currentUser._id,
            status: "pending"
        }).populate("sender", "fullName phone avatar");

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: requests,
        });
    } catch (error) {
        console.error("Get friend requests error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { getFriendRequests };