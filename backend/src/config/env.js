import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multi_tenant_ordering',
  jwtSecret: process.env.JWT_SECRET || 'replace-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173',
};

export default env;
