import { Users } from "../models/user.schema";
import { comparePassword, hashPassword } from "../utils/hashing";
import { _generateToken, _isTokenExpired, _refreshToken } from "../utils/jwt";
import { environment } from "../utils/loadEnvironment";
import { verifyPasswordStrength } from "../utils/string.format";
import { sendVerificationEmail } from "./mailer.service";
import validate from 'deep-email-validator'


const verificationStorage = new Map<string, { code: number, type: VerificationType, date: Date, ipAddress?: string }>();
const MAX_LOGIN_ATTEMPTS = 3;
const RESET_INTERVAL_MINUTES = 0.5;


export const registerUser = async (userName: string, email: string, password: string, ipAddress: string, userAgent?: string) => {

    if (!email || !password || !userName) {
        throw new Error('missing fields');
    }
    const validationResult = await validate(email);
    if (!validationResult.valid) throw new Error('Invalid email address: ' + validationResult.reason);
    if (!verifyPasswordStrength(password)) throw new Error("try a stronger password with at least 8 characters, one uppercase, one lowercase, one number and one special character")

    console.log(`Registering user with email: ${email} and password: ${password}`);
    const userNameExists = await Users.findOne({ userName: userName }).select('_id');

    if (userNameExists) {
        throw new Error('the user name already exists');
    }
    const userEmailExists = await Users.findOne({ email });
    if (userEmailExists) {
        throw new Error('the email already exists');
    }
    const hashedPassword = await hashPassword(password);
    try {
        
        const code = generateVerificationCode();
        await Users.create({
            userName,
            email,
            password: hashedPassword,
            ipRegisteredWith: ipAddress,
            verificationCode: code
        })
        sendVerificationEmail(email, "Welcome to our Application! Verify your email address", code);
        console.log('🎉 user registered successfully');
    } catch (error: any) {
        console.error('🚨 error while creating user ' + error.message);
        throw new Error('error while creating user' + error.message);
    }

}

export const loginUser = async (email: string, password: string, ipAddress?: string, userAgent?: string) => {
    console.log(`Logging in user with email: ${email}`);
    const usersDb = await Users.findOne({ email }).select('password isVerified devices email userName avatar plan loginAttempts stripe');
    if (!usersDb) {
        throw new Error('invalid credentials');
    }
    const isPasswordValid = await comparePassword(password, usersDb.password || '');

    if (!isPasswordValid) {
        await Users.updateOne({ email }, { $inc: { "loginAttempts.attempts": 1 }, $set: { "loginAttempts.lastAttemptAt": new Date(), updated_at: new Date() } });
        throw new Error('invalid credentials');
    }
    if (!usersDb.isVerified) {
        const code = generateVerificationCode();
        await Users.updateOne({ email }, { $set: { verificationCode: code, updated_at: new Date() } });
        await sendVerificationEmail(email, "Verification code for your account", code);
        throw new Error('email not verified, verification code sent to your email');
    }
    const accessToken = await generateTokenForUser(usersDb);
    const refreshToken = await generateRefreshTokenForUser(usersDb.id);
    await Users.updateOne({ email }, { $set: { accessToken, refreshToken, updated_at: new Date() } });
    return { accessToken, refreshToken };
}



export const verifyUserEmail = async (email: string, code: number) => {
    const user = await Users.findOne({ email }).select('isVerified verificationCode');
    if (!user) {
        throw new Error('invalid email');
    }
    if (user.isVerified) {
        throw new Error('verification failed');
    }
    if (user.verificationCode === code) {
        return await Users.updateOne({ email }, { $set: { isVerified: true, updated_at: new Date() } });
    }
    throw new Error('invalid verification code');
}



export const refreshToken = async (refreshToken: string, ipAddress: string) => {
    if (!refreshToken) {
        throw new Error('refresh token is required');
    }
    const user = await Users.findOne({ refreshToken }).select('_id isVerified email userName avatar plan');
    if (!user) {
        throw new Error('invalid tokens');
    }
    if (await _isTokenExpired(refreshToken)) {
        throw new Error('refresh token expired');
    }
    const newAccessToken = await generateTokenForUser(user);
    const newRefreshToken = await _refreshToken(refreshToken, environment.REFRESH_TOKEN_LIFE || "30d");
    try {
        await Users.updateOne({ refreshToken   }, { $set: { accessToken: newAccessToken, refreshToken: newRefreshToken, updated_at: new Date() } })
    } catch (error: any) {
        console.error('🚨 error while updating tokens ' + error.message);
        throw new Error('error while updating tokens');
    }
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}


export const resetPassword = async (email: string, newPassword: string) => {
    console.log(`Resetting password for email: ${email}`);
   
    if (!verifyPasswordStrength(newPassword)) {
        throw new Error('try a stronger password with at least 8 characters, one uppercase, one lowercase, one number and one special character');
    }
    const hashedPassword = await hashPassword(newPassword);
    try {
        console.log('🔐 updating password : ');
        await Users.updateOne({ email }, { $set: { password: hashedPassword, updated_at: new Date() } });
    } catch (error: any) {
        console.error('🚨 error while updating password ' + error.message);
        throw new Error('error while updating password');
    }
    return;
}

export const logout = async (accessToken: string, refreshToken: string) => {
    if (!accessToken || !refreshToken) {
        throw new Error('both tokens are required');
    }
    const user = await Users.findOne({ accessToken, refreshToken }).select('id');
    if (!user) {
        throw new Error('invalid tokens');
    }
    try {
        await Users.updateOne({ accessToken, refreshToken }, { $set : { accessToken: null, refreshToken: null, updated_at: new Date() } })
    } catch (error: any) {
        console.error('🚨 error while revoking device ' + error.message);
        throw new Error('error while revoking device');
    }
    return;
}


// auth 2.0
export const googleAuth = async (profile: any, ipAddress?: string, userAgent?: string) => {
    let userDb = await Users.findOne({ email: profile.emails[0].value }).select('googleId email userName avatar plan');
    let message = undefined;
    if (!userDb) {
        userDb = await Users.create({
            userName: profile.displayName,
            email: profile.emails[0].value,
            ipRegisteredWith: ipAddress,
            isVerified: profile.emails[0].verified,
            googleId: profile.id,
            avatar: profile.photos[0].value
        }).catch((err: any) => {
            console.error("error creating new user with google auth" + err);
            throw new Error("unable to complete the authentication process");
        })

    }

    const accessToken = await generateTokenForUser(userDb);
    const refreshToken = await generateRefreshTokenForUser(userDb?.id);
    await Users.updateOne({ email: userDb?.email }, { $set: { googleId: profile.id || userDb.googleId, avatar: profile.photos[0].value || userDb.avatar, accessToken, refreshToken, isVerified: true, updated_at: new Date() } });
    return { message, accessToken, refreshToken };
}

// export const facebookAuth = async(profile: any)=>{
//     if(!profile.emails || profile.emails.length === 0){
//         throw new Error('email is required');
//     }
//     let userDb = await Users.findOne({ facebookId: profile.id }).select('facebookId email userName avatar plan devices');
//     let messages = [];
//     if(!userDb){
//         userDb = await Users.create({
//             userName: profile.displayName,  
//             isVerified: true,
//             facebookId: profile.id,
//             avatar: profile.photos[0].value
//         }).catch((err: any)=>{
//             console.error("error creating new user with google auth"+err);
//             throw new Error("unable to complete the authentication process");
//         })

//     }
//     if( userDb.devices?.length > 0 ){
//         messages.push('other devices logged in with this account');
//     }
//     const accessToken = await generateTokenForUser(userDb);
//     const refreshToken = await generateRefreshTokenForUser(userDb?.id);
//     await Users.updateOne({email: userDb?.email}, { $push: { devices: { accessToken, refreshToken }}, $set: { updated_at: new Date() }});
//     return { messages, accessToken, refreshToken };
// }


// ....

const generateTokenForUser = async (user: any) => {
    return await _generateToken({ id: user.id, userName: user.userName, email: user.email, plan: user.plan || 'free', avatar: user.avatar || '' }, environment.ACCESS_TOKEN_LIFE || "30m");
}

const generateRefreshTokenForUser = async (userId: string) => {
    return await _generateToken({ userId }, environment.REFRESH_TOKEN_LIFE || "30d");
}

const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code;
}




type VerificationType = 'email verification' | 'password reset' | '2fa verification' | 'phone verification' | 'device verification' | 'other';