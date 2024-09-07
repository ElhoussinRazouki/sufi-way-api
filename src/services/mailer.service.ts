import { transporter } from "../config/mailer.config";
import { logs } from "../utils";



export const sendVerificationEmail = async (email: string, subject: string, code: number)=>{
    await sendEmail(email, subject, undefined, EmailVerificationCodeTemplate(code));
}

export const sendEmailNotification = async (email: string, subject: string, message: string)=>{
    await sendEmail(email, subject, undefined, EmailNotificationTemplate(message));
}

export const sendPasswordResetEmail = async (email: string, code: number)=>{
    await sendEmail(email, 'Password Reset', undefined, PasswordResetTemplate(code));
}

const sendEmail = async (email: string, subject: string, text?: string, html?: string)=>{
    try {
        transporter.sendMail({
            from: 'noreply@mobtwin.com',
            to: email,
            subject,
            text,
            html
        })
    } catch (error: any) {
        logs.error('🚨 error while sending email '+error.message);
        throw new Error('error while sending email');
    }
}

const EmailVerificationCodeTemplate =(otp: number)=> `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    background-color: #f0f2f5;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e6e6e6;
                }
                .header img {
                    width: 120px;
                }
                .title {
                    font-size: 28px;
                    font-weight: 600;
                    margin-top: 20px;
                    color: #222;
                }
                .content {
                    text-align: center;
                    padding: 30px;
                }
                .content p {
                    font-size: 16px;
                    color: #555;
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    margin-bottom:5px;
                    text-align: center;
                }
                .code {
                    font-size: 36px;
                    font-weight: bold;
                    color: #4CAF50;
                    margin: 20px 0;
                    letter-spacing: 4px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #4CAF50;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 16px;
                    font-weight: 500;
                    transition: background-color 0.3s ease;
                }
                .button:hover {
                    background-color: #43a047;
                }
                .footer {
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #e6e6e6;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 class="title">Verify Your Email</h2>
                </div>
                <div class="content">
                    <p>Please use the verification code below to verify your email address:</p>
                    <p class="code">${otp}</p>
                </div>
                <div class="footer">
                    <p>If you did not request this, you can safely ignore this email.</p>
                    <p>Need help? Contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
                </div>
            </div>
        </body>
        </html>
`

const PasswordResetTemplate =(otp: number)=> `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    background-color: #f0f2f5;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e6e6e6;
                }
                .header img {
                    width: 120px;
                }
                .title {
                    font-size: 28px;
                    font-weight: 600;
                    margin-top: 20px;
                    color: #222;
                }
                .content {
                    text-align: center;
                    padding: 30px;
                }
                .content p {
                    font-size: 16px;
                    color: #555;
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    margin-bottom:5px;
                    text-align: center;
                }
                .code {
                    font-size: 36px;
                    font-weight: bold;
                    color: #4CAF50;
                    margin: 20px 0;
                    letter-spacing: 4px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #4CAF50;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 16px;
                    font-weight: 500;
                    transition: background-color 0.3s ease;
                }
                .button:hover {
                    background-color: #43a047;
                }
                .footer {
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #e6e6e6;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 class="title">Verify Your Email</h2>
                </div>
                <div class="content">
                    <p>Please use the verification code below to reset your password:</p>
                    <p class="code">${otp}</p>
                </div>
                <div class="footer">
                    <p>If you did not request this, you can safely ignore this email.</p>
                    <p>Need help? Contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
                </div>
            </div>
        </body>
        </html>
`

const EmailNotificationTemplate =(message: string)=> `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .logo {
            display: block;
            margin: 0 auto;
            width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
        }
        p {
            line-height: 1.5;
        }
        .code {
            font-weight: bold;
            font-size: 18px;
            background-color: #eee;
            padding: 5px 10px;
            border-radius: 3px;
            display: inline-block;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 0.8em;
            color: #aaa;
        }
    </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
        <a href="https://mobtwin.com">
            <img src="https://yt3.googleusercontent.com/iKXHVtR-fLwbz17z4ikGr5nUG37KhCHMqBsqMm8y5K3fvqFqhkMS_7lN61frBDAU3k2qnqWu=s900-c-k-c0x00ffffff-no-rj" alt="mobtwin Logo" class="logo">
        </a>
        </div>
        <div class="content">
        <p>Thank you for using our service!</p>
        <p>${message}</p>
        </div>
        <div class="footer">
        <p>If you have any problems, please don't hesitate to contact us at dev.mobtwin@gmail.com.</p>
        <p>Sincerely,</p>
        <p>Mobtwin Team</p>
        </div>
    </div>
    </body>
    </html>`

const EmailChangedNotificationTemplate =(oldEmail: string, newEmail: string)=> `
    <style>
    body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    color: #333;
    background-color: #f7f7f7;
    }
    h1, h2, p {
    margin: 15px 0;
    }
    .container {
    padding: 20px;
    max-width: 600px;
    margin: 20px auto;
    border: 1px solid #ddd;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .info-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    }
    .info-section span {
    font-weight: bold;
    color: #555;
    }
    .info-section span:last-child {
    color: #333;
    }
    .btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s;
    }
    .btn:hover {
    background-color: #0056b3;
    }
    </style>
    <div class="container">
    <h1>Important Update: Your Email Address for Mobtwin Has Been Changed</h1>
    <p>This email is to inform you that the email address associated with your account on Mobtwin has been changed.</p>
    <h2>Here are the details:</h2>
    <div class="info-section">
    <span>Old Email Address:</span>
    <span>[Previous Email Address]</span>
    </div>
    <div class="info-section">
    <span>New Email Address:</span>
    <span>[New Email Address]</span>
    </div>
    <h2>What you need to do:</h2>
    <p>If you initiated this change, you can disregard this email.</p>
    <p>However, if you did not request this change, please contact us immediately at <a href="mailto:support@example.com">support@example.com</a> or <a href="tel:+1234567890">+1234567890</a> to verify your account ownership and secure it.</p>
    <h2>For your security:</h2>
    <p>We take the security of your account very seriously. To ensure the legitimacy of this change, we will monitor your account activity for the next days.</p>
    <h2>Additional Information:</h2>
    <p>You can continue to use Mobtwin with your new email address.</p>
    <p>Any future notifications or updates will be sent to your new email address.</p>
    <p>If you have any questions or concerns, please don't hesitate to <a href="#">contact us</a>.</p>
    <p>Sincerely,<br>Mobtwin Team</p>
    </div>

`

