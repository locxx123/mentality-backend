const { baseResponse } = require("@src/config/response");
const Message = require("@src/models/Message");
const User = require("@src/models/User");

const getChatList = async (req, res) => {
  try {
    const myId = req.user._id;
    const myIdStr = myId.toString();

    // Lấy tất cả tin nhắn liên quan đến tôi, mới nhất trước
    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Map: key = otherUserId (string) -> lastMessage (object)
    const chatMap = new Map();
    for (const msg of messages) {
      const senderIdStr = msg.senderId?.toString?.();
      const receiverIdStr = msg.receiverId?.toString?.();

      // xác định user "đối diện" với mình cho message này
      const otherUserIdStr = senderIdStr === myIdStr ? receiverIdStr : senderIdStr;

      // lưu message đầu tiên gặp (do messages đã sort desc => đó là lastMessage)
      if (otherUserIdStr && !chatMap.has(otherUserIdStr)) {
        chatMap.set(otherUserIdStr, msg);
      }
    }

    const userIds = Array.from(chatMap.keys());
    // Lấy thông tin user (nếu user đã bị xóa thì sẽ không có trong result)
    const users = await User.find({ _id: { $in: userIds } })
      .select("_id fullName avatar")
      .lean();

    const usersById = new Map(users.map(u => [u._id.toString(), u]));

    // Tạo chatList dựa trên userIds (đảm bảo không mất cuộc trò chuyện nếu user đã bị xóa)
    const chatList = userIds.map(uid => {
      const user = usersById.get(uid);
      const lastMsg = chatMap.get(uid) || null;

      // format user (chuyển _id -> id)
      const formattedUser = user ? {
        id: user._id.toString(),
        fullName: user.fullName,
        avatar: user.avatar,
      } : {
        // fallback nếu user bị xóa
        id: uid,
        fullName: null,
        avatar: null,
      };

      // format lastMessage (chuyển _id -> id, senderId/receiverId -> string)
      let formattedLastMessage = null;
      if (lastMsg) {
        formattedLastMessage = { ...lastMsg };
        if (formattedLastMessage._id) {
          formattedLastMessage.id = formattedLastMessage._id.toString();
          delete formattedLastMessage._id;
        }
        if (formattedLastMessage.senderId) formattedLastMessage.senderId = formattedLastMessage.senderId.toString();
        if (formattedLastMessage.receiverId) formattedLastMessage.receiverId = formattedLastMessage.receiverId.toString();
      }

      return {
        user: formattedUser,
        lastMessage: formattedLastMessage,
      };
    });

    // sắp xếp theo createdAt của lastMessage (mới -> cũ)
    chatList.sort((a, b) => {
      const ta = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tb = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tb - ta;
    });

    return baseResponse(res, {
      success: true,
      statusCode: 200,
      msg: "CHAT_LIST_RETRIEVED",
      data: chatList,
    });
  } catch (error) {
    console.error("Error in getChatList controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getChatList };
