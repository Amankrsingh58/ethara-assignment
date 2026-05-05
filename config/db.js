const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = "mongodb+srv://mytutormatch:783447@tutormatch.hrzdv.mongodb.net/team-task-manager?retryWrites=true&w=majority";
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
