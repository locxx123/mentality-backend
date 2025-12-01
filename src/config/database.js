import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dbConfig = {
    url: process.env.MONGODB_URI,
    options: {
        // No need for useNewUrlParser or useUnifiedTopology anymore
    },
};

const connectDB = async () => {
    try {
        await mongoose.connect(dbConfig.url);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

export { connectDB };
