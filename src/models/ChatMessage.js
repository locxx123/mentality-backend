import mongoose from "mongoose";
const { Schema } = mongoose;

const chatMessageSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: "ChatSession",
            required: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        response: {
            type: String,
            trim: true,
        },
        sentiment: {
            type: String,
            enum: ['positive', 'negative', 'neutral'],
        },
        sentimentScore: {
            type: Number,
            min: -1,
            max: 1,
        },
        isFromUser: {
            type: Boolean,
            required: true,
            default: true,
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

// Index để query conversation theo userId và sessionId
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;

