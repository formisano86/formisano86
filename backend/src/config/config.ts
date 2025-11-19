import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: string | number;
  nodeEnv: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    mode: string;
  };
  klarna: {
    username: string;
    password: string;
    region: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  upload: {
    maxFileSize: number;
    uploadPath: string;
  };
}

export const config: Config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: process.env.PAYPAL_MODE || 'sandbox',
  },
  klarna: {
    username: process.env.KLARNA_USERNAME || '',
    password: process.env.KLARNA_PASSWORD || '',
    region: process.env.KLARNA_REGION || 'eu',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
};
