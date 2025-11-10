const Emotion = require("@models/Emotion");
const { baseResponse } = require("@src/config/response");

const getTrends = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'week' } = req.query; // week, month, year

        let startDate = new Date();
        let groupBy = '%Y-%m-%d'; // Default: group by day

        switch (period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                groupBy = '%Y-%m-%d';
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                groupBy = '%Y-%m-%d';
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                groupBy = '%Y-%m';
                break;
        }

        // Get emotions in the period
        const emotions = await Emotion.find({
            userId,
            date: { $gte: startDate },
        }).sort({ date: 1 });

        // Calculate statistics
        const emotionCounts = {};
        const moodRatings = [];
        const emotionByType = {};

        emotions.forEach(emotion => {
            // Count by type
            emotionCounts[emotion.emotionType] = (emotionCounts[emotion.emotionType] || 0) + 1;
            
            // Collect mood ratings
            moodRatings.push(emotion.moodRating);
            
            // Group by type
            if (!emotionByType[emotion.emotionType]) {
                emotionByType[emotion.emotionType] = [];
            }
            emotionByType[emotion.emotionType].push(emotion.moodRating);
        });

        // Calculate averages
        const averageMood = moodRatings.length > 0
            ? (moodRatings.reduce((a, b) => a + b, 0) / moodRatings.length).toFixed(2)
            : 0;

        // Calculate positive vs negative
        const positiveEmotions = ['happy', 'excited', 'calm', 'grateful'];
        const negativeEmotions = ['sad', 'anxious', 'stressed', 'angry', 'lonely', 'tired'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        Object.keys(emotionCounts).forEach(type => {
            if (positiveEmotions.includes(type)) {
                positiveCount += emotionCounts[type];
            } else if (negativeEmotions.includes(type)) {
                negativeCount += emotionCounts[type];
            }
        });

        // Generate insights
        const insights = [];
        if (negativeCount > positiveCount * 1.5) {
            insights.push("Tuần này bạn có nhiều ngày căng thẳng hơn bình thường. Hãy thử các kỹ thuật thư giãn như thiền hoặc hít thở sâu.");
        } else if (positiveCount > negativeCount * 1.5) {
            insights.push("Bạn đang có một tuần tích cực! Hãy tiếp tục duy trì tinh thần tốt này.");
        }

        if (parseFloat(averageMood) < 2.5) {
            insights.push("Mood rating trung bình của bạn khá thấp. Hãy cân nhắc thử các hoạt động nâng cao tinh thần như thể dục, gặp gỡ bạn bè, hoặc đọc sách.");
        }

        // Group by date for chart
        const chartData = {};
        emotions.forEach(emotion => {
            const dateKey = emotion.date.toISOString().split('T')[0];
            if (!chartData[dateKey]) {
                chartData[dateKey] = { date: dateKey, moodRatings: [], emotions: [] };
            }
            chartData[dateKey].moodRatings.push(emotion.moodRating);
            chartData[dateKey].emotions.push(emotion.emotionType);
        });

        const chartDataArray = Object.values(chartData).map(item => ({
            date: item.date,
            averageMood: (item.moodRatings.reduce((a, b) => a + b, 0) / item.moodRatings.length).toFixed(2),
            emotionCount: item.emotions.length,
        }));

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                period,
                startDate,
                statistics: {
                    totalEmotions: emotions.length,
                    averageMood: parseFloat(averageMood),
                    emotionCounts,
                    positiveCount,
                    negativeCount,
                    positivePercentage: emotions.length > 0 
                        ? ((positiveCount / emotions.length) * 100).toFixed(2) 
                        : 0,
                    negativePercentage: emotions.length > 0 
                        ? ((negativeCount / emotions.length) * 100).toFixed(2) 
                        : 0,
                },
                chartData: chartDataArray,
                insights,
            },
            msg: "GET_TRENDS_SUCCESS",
        });

    } catch (error) {
        console.error("Get trends error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { getTrends };

