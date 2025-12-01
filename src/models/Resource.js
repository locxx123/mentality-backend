import mongoose from "mongoose";
const { Schema } = mongoose;

const resourceSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['article', 'podcast', 'video', 'exercise', 'meditation', 'breathing', 'music'],
        },
        content: {
            type: String,
            trim: true,
        },
        url: {
            type: String,
            trim: true,
        },
        thumbnail: {
            type: String,
        },
        category: {
            type: String,
            enum: ['anxiety', 'depression', 'stress', 'mindfulness', 'self-care', 'relationships', 'work', 'general'],
        },
        tags: [{
            type: String,
            trim: true,
        }],
        duration: {
            type: Number, // in minutes
        },
        isActive: {
            type: Boolean,
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

// Index để query resources
resourceSchema.index({ type: 1, category: 1, isActive: 1 });

const Resource = mongoose.model("Resource", resourceSchema);
export default Resource;

