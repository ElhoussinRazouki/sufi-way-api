import { transporter } from "../config/mailer.config";
import { logs } from "../utils";
import GeneralSettingsService from "./general.settings.service";



export const askSheikh = async ({ email, subject, question }: { email: string, subject: string, question: string }) => {
    const GeneralSettings = await GeneralSettingsService.details();
    await sendEmail(GeneralSettings.sheikhEmail, subject, undefined, AskSheikhTemplate(email, subject, question, GeneralSettings.supportEmail));
}

export const contactSupport = async ({ email, subject, question }: { email: string, subject: string, question: string }) => {
    const GeneralSettings = await GeneralSettingsService.details();
    await sendEmail(GeneralSettings.supportEmail, subject, undefined, askSupportTemplate(email, subject, question, GeneralSettings.supportEmail));
}

export const sendVerificationEmail = async (email: string, subject: string, code: number) => {
    const GeneralSettings = await GeneralSettingsService.details();
    await sendEmail(email, subject, undefined, EmailVerificationCodeTemplate(code, GeneralSettings.supportEmail));
}

export const sendPasswordResetEmail = async (email: string, code: number) => {
    const GeneralSettings = await GeneralSettingsService.details();
    await sendEmail(email, 'Password Reset', undefined, PasswordResetTemplate(code, GeneralSettings.supportEmail));
}

// senEmail function
const sendEmail = async (email: string, subject: string, text?: string, html?: string) => {
    try {
        transporter.sendMail({
            from: 'noreply@sufi-way.com',
            to: email,
            subject,
            text,
            html
        })
    } catch (error: any) {
        logs.error('🚨 error while sending email ' + error.message);
        throw new Error('خطأ أثناء إرسال البريد الإلكتروني');
    }
}

// templates
const EmailVerificationCodeTemplate = (otp: number, supportEmail: string) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد البريد الإلكتروني</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0f2f5;
            color: #333;
            margin: 0;
            padding: 0;
            direction: rtl;
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
            margin-bottom: 5px;
            text-align: center;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            color: #4CAF50;
            margin: 20px 0;
            letter-spacing: 4px;
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
            <h2 class="title">تأكيد بريدك الإلكتروني</h2>
        </div>
        <div class="content">
            <p>يرجى استخدام الرمز أدناه لتأكيد عنوان بريدك الإلكتروني:</p>
            <p class="code">${otp}</p>
        </div>
        <div class="footer">
            <p>إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.</p>
            <p>.<a href="mailto:${supportEmail}">${supportEmail}</a> : تحتاج إلى مساعدة؟ تواصل معنا على </p>
        </div>
    </div>
</body>
</html>`;


const PasswordResetTemplate = (otp: number, supportEmail: string) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0f2f5;
            color: #333;
            margin: 0;
            padding: 0;
            direction: rtl;
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
            margin-bottom: 5px;
            text-align: center;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            color: #4CAF50;
            margin: 20px 0;
            letter-spacing: 4px;
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
            <h2 class="title">إعادة تعيين كلمة المرور</h2>
        </div>
        <div class="content">
            <p>يرجى استخدام الرمز أدناه لإعادة تعيين كلمة المرور:</p>
            <p class="code">${otp}</p>
        </div>
        <div class="footer">
            <p>إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.</p>
            <p>.<a href="mailto:${supportEmail}">${supportEmail}</a> : تحتاج إلى مساعدة؟ تواصل معنا على </p>
        </div>
    </div>
</body>
</html>`;


const AskSheikhTemplate = (email: string, subject: string, question: string, supportEmail: string) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم استلام سؤالك</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0f2f5;
            color: #333;
            margin: 0;
            padding: 0;
            direction: rtl;
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
            margin-bottom: 10px;
        }
        .info {
            font-size: 18px;
            font-weight: bold;
            color: #4CAF50;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e6e6e6;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 class="title">تم طرح سؤال جديد</h2>
        </div>
        <div class="content">
            <p> ${email} : <strong>البريد الإلكتروني</strong> </p>
            <p> ${subject} : <strong>الموضوع</strong> </p>
            <p> : <strong>السؤال</strong></p>
            <p class="info">${question}</p>
        </div>
        <div class="footer">
        </div>
    </div>
</body>
</html>`;


const askSupportTemplate = (email: string, subject: string, question: string, supportEmail: string) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم استلام سؤالك</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0f2f5;
            color: #333;
            margin: 0;
            padding: 0;
            direction: rtl;
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
            margin-bottom: 10px;
        }
        .info {
            font-size: 18px;
            font-weight: bold;
            color: #4CAF50;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e6e6e6;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 class="title">سؤال جديد تم طرحه للدعم</h2>
        </div>
        <div class="content">
            <p> ${email} : <strong>البريد الإلكتروني</strong> </p>
            <p> ${subject} : <strong>الموضوع</strong> </p>
            <p> : <strong>السؤال</strong></p>
            <p class="info">${question}</p>
        </div>
        <div class="footer">
        </div>
    </div>
</body>
</html>`;



const mailerService = {
    askSheikh,
    contactSupport,
    sendVerificationEmail,
    sendPasswordResetEmail
}

export default mailerService