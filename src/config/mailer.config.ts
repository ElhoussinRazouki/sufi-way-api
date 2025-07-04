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


transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});