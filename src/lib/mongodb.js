import dotenv from 'dotenv'
dotenv.config();

import mongoose from 'mongoose';

const connectDB = async () => {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
};

export default connectDB;