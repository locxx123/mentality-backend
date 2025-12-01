const transformEmotion = (emotionDoc) => {
    if (!emotionDoc) return null;

    const emotionObject = emotionDoc.toObject({ getters: true });
    const emotionType = emotionObject.emotionType;
    const moodRating = emotionObject.moodRating;
    const journalEntry = emotionObject.journalEntry || "";

    return {
        id: emotionObject._id?.toString?.() || emotionObject.id,
        emotion: emotionType,
        emotionType,
        intensity: moodRating,
        moodRating,
        description: journalEntry,
        journalEntry,
        tags: emotionObject.tags || [],
        emoji: emotionObject.emoji || "",
        date: emotionObject.date,
        createdAt: emotionObject.createdAt,
        updatedAt: emotionObject.updatedAt,
    };
};

export { transformEmotion };


