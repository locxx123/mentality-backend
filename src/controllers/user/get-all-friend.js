const FriendRequest = require("@models/FriendRequest");
const { baseResponse } = require("@src/config/response");

const getAllFriends = async (req, res) => {
    try {
        const currentUser = req.user;

        // Tìm tất cả mối quan hệ bạn bè đã chấp nhận
        const friends = await FriendRequest.find({
            status: "accepted",
            $or: [
                { sender: currentUser._id },
                { receiver: currentUser._id }
            ]
        })
        .populate("sender", "fullName phone avatar")
        .populate("receiver", "fullName phone avatar");

        // Trả về danh sách bạn bè (người còn lại trong mỗi bản ghi)
        const friendList = friends.map(fr => {
            const isSender = fr.sender._id.toString() === currentUser._id.toString();
            const friend = isSender ? fr.receiver : fr.sender;
            return {
                id: friend._id,
                fullName: friend.fullName,
                phone: friend.phone,
                avatar: friend.avatar,
            };
        });

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: friendList,
        });
    } catch (error) {
        console.error("Get all friends error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { getAllFriends };