const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        image: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id.toString(); // chuyển ObjectId thành string
                delete ret._id;
                delete ret.__v;
            },
        }
    }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
