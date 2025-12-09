const mongoose = require('mongoose');
const logger = require('../../../../shared/utils/logger');

const connectDatabase = async () => {
  try {
    // In Docker, use service name 'mongodb' with port 27017
    // For external connections, use localhost:27018
    const mongoHost = process.env.MONGODB_HOST || 'mongodb';
    const mongoPort = process.env.MONGODB_PORT || '27017';
    const mongoUri = process.env.MONGODB_URI || `mongodb://admin:admin123@${mongoHost}:${mongoPort}/ecommerce?authSource=admin`;
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(mongoUri, options);
    
    logger.info('MongoDB connected successfully', {
      service: 'chatbot-service',
      database: mongoose.connection.name
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

module.exports = { connectDatabase };

