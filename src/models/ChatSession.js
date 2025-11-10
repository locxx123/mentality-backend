const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSessionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            trim: true,
            default: "Cuộc trò chuyện mới",
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
            },
        }
    }
);

// Index để query sessions theo userId và lastMessageAt
chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
module.exports = ChatSession;

