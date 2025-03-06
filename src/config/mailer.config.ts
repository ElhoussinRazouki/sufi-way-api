import nodemailer from 'nodemailer';
import { environment } from '../utils/loadEnvironment';


export const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    auth: {
        user: environment.EMAIL_USER,
        pass: environment.EMAIL_PASSWORD
    }
});
