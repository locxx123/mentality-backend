const User = require("@models/User");
const { baseResponse } = require("@src/config/response");

const search = async (req, res) => {
    try {
        const currentUser = req.user; // user đang đăng nhập
        const { phone } = req.query;

        // Tìm user theo phone
        const foundUser = await User.findByPhone(phone)

        let result;
        let msg;

        if (!foundUser) {
            // Trường hợp 3: chưa đăng ký
            result = {
                phone: phone,
            }
            msg = "NOT_REGISTERED"
        } else {
            // Đã đăng ký
            const friendObj = currentUser.friends?.find(
                (friend) => friend.userId?.toString() === foundUser._id.toString()
            );

            let isFriend = false;
            let isPending = false;

            if (friendObj) {
                if (friendObj.status === "accepted") {
                    isFriend = true;
                } else if (friendObj.status === "pending") {
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
            }
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

module.exports = {
    search,
};
