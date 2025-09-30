const User = require("@models/User");
const FriendRequest = require("@models/FriendRequest");
const { baseResponse } = require("@src/config/response");

const search = async (req, res) => {
    try {
        const currentUser = req.user;
        const { phone } = req.query;

        // Tìm user theo phone
        const foundUser = await User.findByPhone(phone);

        let result;
        let msg;

        if (!foundUser) {
            // Trường hợp 3: chưa đăng ký
            result = { phone: phone };
            msg = "NOT_REGISTERED";
        } else {
            // Đã đăng ký
            // Tìm mối quan hệ bạn bè giữa currentUser và foundUser
            const friendRequest = await FriendRequest.findOne({
                $or: [
                    { sender: currentUser._id, receiver: foundUser._id },
                    { sender: foundUser._id, receiver: currentUser._id }
                ],
                status: { $in: ["pending", "accepted"] }
            });

            let isFriend = false;
            let isPending = false;

            if (friendRequest) {
                if (friendRequest.status === "accepted") {
                    isFriend = true;
                } else if (friendRequest.status === "pending") {
                    isPending = true;
                }
            }

            if (isFriend) {
                msg = "REGISTERED_AND_FRIEND";
            } else if (isPending) {
                msg = "REGISTERED_AND_PENDING";
            } else {
                msg = "REGISTERED_NOT_FRIEND";
            }
            result = {
                user: {
                    id: foundUser._id,
                    fullName: foundUser.fullName,
                    phone: foundUser.phone,
                    avatar: foundUser.avatar,
                    isFriend,
                    isPending
                },
            };
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: msg,
            data: result,
        });
    } catch (error) {
        console.error("Search error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { search };