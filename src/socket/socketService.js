const { io } = require("../lib/socket");

const emitToUser = (userId, event, data) => {
    io.to(userId.toString()).emit(event, data); // emit đến room userId
};

module.exports = { emitToUser };
