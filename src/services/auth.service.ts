import { Users } from "../models/user.schema";
import { RegisterSchema } from "../types/auth.types";
import { logs } from "../utils";
import { comparePassword, hashPassword } from "../utils/hashing";
import { _generateToken, _isTokenExpired, _refreshToken } from "../utils/jwt";
import { environment } from "../utils/loadEnvironment";
import { verifyPasswordStrength } from "../utils/string.format";
import { sendPasswordResetEmail, sendVerificationEmail } from "./mailer.service";

const MAX_LOGIN_ATTEMPTS = 3;
const RESET_INTERVAL_MINUTES = 10;

export const registerUser = async (username: string, email: string, password: string) => {
    await RegisterSchema.validate({ username, email, password });

    logs.log(`Registering user with email: ${email} and password: ${password}`);
    const userNameExists = await Users.findOne({ userName: username }).select('_id');

    if (userNameExists) {
        throw new Error('اسم المستخدم موجود بالفعل');
    }
    const userEmailExists = await Users.findOne({ email });
    if (userEmailExists) {
        throw new Error('البريد الإلكتروني موجود بالفعل');
    }
    const hashedPassword = await hashPassword(password);
    try {
        const code = generateVerificationCode();
        await Users.create({
            userName: username,
            email,
            password: hashedPassword,
            verificationCode: code
        });
        sendVerificationEmail(email, "Welcome to our Application! Verify your email address", code);
        logs.log('🎉 user registered successfully');
    } catch (error: any) {
        logs.error('🚨 error while creating user ' + error.message);
        throw new Error('خطأ أثناء إنشاء المستخدم: ' + error.message);
    }
}

export const loginUser = async (email: string, password: string) => {
    logs.log(`Logging in user with email: ${email}`);
    const usersDb = await Users.findOne({ email }).select('password isVerified email userName avatar plan loginAttempts isAdmin');
    if (!usersDb) {
        throw new Error('المعلومات غير صحيحة حاول مرة أخرى');
    }
    // if (usersDb.loginAttempts.attempts as number >= MAX_LOGIN_ATTEMPTS && new Date().getTime() - (usersDb.loginAttempts?.lastAttemptAt as Date).getTime() < RESET_INTERVAL_MINUTES * 60 * 1000) {
    //     throw new Error('لقد وصلت إلى الحد الأقصى من المحاولات، حاول مرة أخرى لاحقًا');
    // }
    const isPasswordValid = await comparePassword(password, usersDb.password || '');

    if (!isPasswordValid) {
        await Users.updateOne({ email }, { $inc: { "loginAttempts.attempts": 1 }, $set: { "loginAttempts.lastAttemptAt": new Date(), updated_at: new Date() } });
        throw new Error('المعلومات غير صحيحة حاول مرة أخرى');
    }
    if (!usersDb.isVerified) {
        const code = generateVerificationCode();
        await Users.updateOne({ email }, { $set: { verificationCode: code, updated_at: new Date() } });
        await sendVerificationEmail(email, "Verification code for your account", code);
        throw new Error('البريد الإلكتروني غير مؤكد، تم إرسال رمز التحقق إلى بريدك الإلكتروني');
    }
    const accessToken = await generateTokenForUser(usersDb);
    const refreshToken = await generateRefreshTokenForUser(usersDb.id);
    await Users.updateOne({ email }, { $set: { accessToken, refreshToken, updated_at: new Date() } });
    return { accessToken, refreshToken };
}

export const verifyUserEmail = async (email: string, code: number) => {
    const user = await Users.findOne({ email }).select('_id isVerified verificationCode email userName avatar plan isAdmin');
    if (!user) {
        throw new Error('بريد الكتروني غير صالح');
    }
    if (user.isVerified) {
        throw new Error('فشل التحقق');
    }
    if (user.verificationCode === code) {
        const accessToken = await generateTokenForUser({ ...user.toJSON(), id: user.id, isVerified: true });
        const refreshToken = await generateRefreshTokenForUser(user.id);
        await Users.updateOne({ email }, { $set: { isVerified: true, accessToken, refreshToken, updated_at: new Date() } });
        return { accessToken, refreshToken };
    }
    throw new Error('رمز التحقق غير صالح');
}

export const refreshToken = async (refreshToken: string) => {
    if (!refreshToken) {
        throw new Error('رمز التحديث مطلوب');
    }
    const user = await Users.findOne({ refreshToken }).select('_id isVerified email userName avatar plan isAdmin');
    if (!user) {
        throw new Error('رمز غير صالح');
    }
    if (await _isTokenExpired(refreshToken)) {
        throw new Error('رمز التحديث منتهي الصلاحية');
    }
    const newAccessToken = await generateTokenForUser(user);
    const newRefreshToken = await _refreshToken(refreshToken, environment.REFRESH_TOKEN_LIFE || "30d");
    try {
        await Users.updateOne({ refreshToken }, { $set: { accessToken: newAccessToken, refreshToken: newRefreshToken, updated_at: new Date() } });
    } catch (error: any) {
        logs.error('🚨 error while updating tokens ' + error.message);
        throw new Error('خطأ أثناء تحديث الرموز');
    }
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export const resetPassword = async (email: string, code: number, newPassword: string) => {
    const userDb = await Users.findOne({ email }).select('isVerified email userName avatar plan verificationCode isAdmin');
    if (!userDb) {
        throw new Error('بريد الكتروني غير صالح');
    }
    if (!userDb.isVerified) {
        throw new Error('البريد الإلكتروني غير مؤكد');
    }
    if (!userDb.verificationCode) {
        throw new Error('الرمز التحقق منتهي الصلاحية. اطلب رمزًا جديدًا');
    }
    if (userDb.verificationCode !== code) {
        throw new Error('رمز التحقق غير صالح');
    }
    if (!verifyPasswordStrength(newPassword)) {
        throw new Error('حاول استخدام كلمة مرور أقوى تحتوي على 8 أحرف على الأقل، حرف كبير واحد، حرف صغير واحد، رقم واحد على الأقل');
    }
    const hashedPassword = await hashPassword(newPassword);
    try {
        logs.log('🔐 updating password: ');
        await Users.updateOne({ email }, { $set: { password: hashedPassword, verificationCode: null, updated_at: new Date() } });
    } catch (error: any) {
        logs.error('🚨 error while updating password ' + error.message);
        throw new Error('خطأ أثناء تحديث كلمة المرور');
    }
    
    const accessToken = await generateTokenForUser(userDb);
    const refreshToken = await generateRefreshTokenForUser(userDb.id);
    await Users.updateOne({ email }, { $set: { accessToken, refreshToken, updated_at: new Date() } });
    return { accessToken, refreshToken };
}

export const verifyResetPasswordCode = async (email: string, code: number) => {
    const userDb = await Users.findOne({ email }).select('isVerified verificationCode');
    if (!userDb) {
        throw new Error('بريد الكتروني غير صالح');
    }
    if (!userDb.isVerified) {
        throw new Error('البريد الإلكتروني غير مؤكد');
    }

    if (userDb.verificationCode !== code) {
        throw new Error('رمز التحقق غير صالح');
    }
    return;
}

export const requestResetPassword = async (email: string) => {
    const code = generateVerificationCode();
    await Users.updateOne({ email }, { $set: { verificationCode: code, updated_at: new Date() } }).then(() => {
        sendPasswordResetEmail(email, code);
    });
}

export const logout = async (accessToken: string, refreshToken: string) => {
    if (!accessToken || !refreshToken) {
        throw new Error('كلا الرمزين مطلوبان');
    }
    const user = await Users.findOne({ accessToken, refreshToken }).select('id');
    if (!user) {
        throw new Error('رموز غير صالحة');
    }
    try {
        await Users.updateOne({ accessToken, refreshToken }, { $set: { accessToken: null, refreshToken: null, updated_at: new Date() } });
    } catch (error: any) {
        logs.error('🚨 error while revoking device ' + error.message);
        throw new Error('خطأ أثناء إلغاء جهاز');
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
            logs.error("error creating new user with google auth" + err);
            throw new Error("غير قادر على إكمال عملية المصادقة");
        });
    }

    const accessToken = await generateTokenForUser(userDb);
    const refreshToken = await generateRefreshTokenForUser(userDb?.id);
    await Users.updateOne({ email: userDb?.email }, { $set: { googleId: profile.id || userDb.googleId, avatar: profile.photos[0].value || userDb.avatar, accessToken, refreshToken, isVerified: true, updated_at: new Date() } });
    return { message, accessToken, refreshToken };
}

const generateTokenForUser = async (user: any) => {
    return await _generateToken({ id: user.id, userName: user.userName, email: user.email, plan: user.plan || 'free', avatar: user.avatar || '', isAdmin: user.isAdmin }, environment.ACCESS_TOKEN_LIFE || "30m");
}

const generateRefreshTokenForUser = async (userId: string) => {
    return await _generateToken({ userId }, environment.REFRESH_TOKEN_LIFE || "30d");
}

const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code;
}
