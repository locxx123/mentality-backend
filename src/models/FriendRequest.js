const mongoose = require("mongoose");
const { Schema } = mongoose;
const friendRequestSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },  // Người gửi
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Người nhận
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
    },
    invitedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date }
}, {
    timestamps: true, toJSON: {
        transform(doc, ret) {
            ret.id = ret._id.toString(); // chuyển ObjectId thành string
            delete ret._id;
            delete ret.__v;
        }
    }
})

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema)
module.exports = FriendRequest;