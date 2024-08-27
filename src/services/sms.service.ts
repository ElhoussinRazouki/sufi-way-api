import { client } from "../config/sms.config";



export const sendVerificationSms = async (phoneNumber: string, code: number)=>{
    console.log(`Sending login verification code to phone number: ${phoneNumber}`);
    try {
        await sendSMS(phoneNumber, `M-${code} is your mobtwin verification code`)
    } catch (error: any) {
        console.error('🚨 error while sending sms '+error.message);
        throw new Error('error while sending sms');
    }
    return;
}


const sendSMS = async (phoneNumber: string, message: string)=>{
    console.log(`Sending message to phone number: ${phoneNumber}`);
    await client.messages.create({
        body: message,
        from: '+212646192020',
        to: phoneNumber
    });
    return;
}