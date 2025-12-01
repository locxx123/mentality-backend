import mongoose from "mongoose";
const { Schema } = mongoose;

const emotionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    emotionType: {
      type: String,
      required: true,
      enum: [
        "happy",
        "sad",
        "loved",
        "anxious",
        "angry",
        "tired",
        "calm",
        "confused",
      ],
    },
    moodRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    journalEntry: {
      type: String,
      trim: true,
      maxLength: 2000,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    emoji: {
      type: String,
    },
    vector: { type: [Number], default: [] },
    date: {
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
    },
  }
);

// Index để query nhanh theo userId và date
emotionSchema.index({ userId: 1, date: -1 });
emotionSchema.index({ userId: 1, emotionType: 1 });

const Emotion = mongoose.model("Emotion", emotionSchema);
export default Emotion;
