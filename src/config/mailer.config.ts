import nodemailer from 'nodemailer';
import { environment } from '../utils/loadEnvironment';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS instead of implicit SSL
    auth: {
        user: environment.EMAIL_USER,
        pass: environment.EMAIL_PASSWORD
    },
    // Add timeout settings to avoid hanging connections
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,   // 5 seconds
    socketTimeout: 10000     // 10 seconds
});
