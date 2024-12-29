import dotenv from 'dotenv'

dotenv.config();

export const environment: {
  PORT: string,
  EMAIL_USER: string,
  EMAIL_PASSWORD: string,
  MONGODB_URI: string,
  JWT_SECRET: string,
  GOOGLE_CLIENT_ID: string,
  GOOGLE_CLIENT_SECRET: string,
  GOOGLE_AUTH_CALLBACK: string,
  HOST: string,
  ACCESS_TOKEN_LIFE: string,
  REFRESH_TOKEN_LIFE: string,
  S3_BUCKET_HOST: string,
  S3_ENDPOINT: string,
  S3_HOST: string,
  S3_ACCESS_KEY: string,
  S3_SECRET_KEY: string,
  S3_BUCKET_NAME: string,
} = {
  PORT: process.env.PORT as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  MONGODB_URI: process.env.MONGODB_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_AUTH_CALLBACK: process.env.GOOGLE_AUTH_CALLBACK as string,
  HOST: process.env.HOST as string,
  ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE as string,
  REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE as string,
  S3_BUCKET_HOST: process.env.S3_BUCKET as string,
  S3_ENDPOINT: process.env.S3_ENDPOINT as string,
  S3_HOST: process.env.S3_HOST as string,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY as string,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY as string,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME as string,
};
