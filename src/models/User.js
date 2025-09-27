const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        sessionId: {
            type: String,
            unique: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        profile: {
            type: Schema.Types.Mixed, // Cho phép mọi kiểu dữ liệu object (tùy ý)
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
