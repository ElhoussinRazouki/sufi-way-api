import nodemailer from 'nodemailer';
import { environment } from '../utils/loadEnvironment';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use STARTTLS instead of implicit SSL
    auth: {
        user: environment.EMAIL_USER,
        pass: environment.EMAIL_PASSWORD
    },
});
