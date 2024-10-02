import fs from "fs";
import path from "path";
import { Users } from "../models/user.schema";
import { comparePassword, hashPassword } from "../utils/hashing";
import { validateName, verifyPasswordStrength } from "../utils/string.format";
import { environment } from "../utils/loadEnvironment";
import { logs } from "../utils";


// manage user info
export const getProfile = async (_id: string) => {
    const user = await Users.findOne({ _id }).select("userName email plan avatar isVerified password recoveryEmail is2faActive firstName lastName").lean();
    if (!user) {
        throw new Error('ملف المستخدم غير موجود');
    }
    if (user.password) {
        delete user.password;
        return { ...user, havePassword: true };
    }
    return { ...user, havePassword: false };
}

export const changePassword = async (userId: string, oldPassword: string, newPassword: string, otp: number) => {
    if (!oldPassword || !newPassword || !otp) {
        throw new Error('حقول مفقودة');
    }
    const user = await Users.findOne({ _id: userId }).select('password').lean();
    if (!user) {
        throw new Error('المستخدم غير موجود');
    }
    if (oldPassword === newPassword) throw new Error('كلمة المرور الجديدة لا يمكن أن تكون مثل كلمة المرور القديمة');
    if (!await comparePassword(oldPassword, user.password as string)) {
        throw new Error('كلمة المرور غير صحيحة');
    }
    if (!verifyPasswordStrength(newPassword)) throw new Error("جرب استخدام كلمة مرور أقوى تحتوي على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم، ورمز خاص");
    const hashedPassword = await hashPassword(newPassword);
    try {
        await Users.updateOne({ _id: userId }, { $set: { password: hashedPassword,  updated_at: new Date() } });
    } catch (error) {
        logs.log(error);
        throw new Error('فشل تغيير كلمة المرور');
    }
}

export const changeName = async (userId: string, firstName: string, lastName: string) => {
    if (!firstName && !lastName) {
        throw new Error('حقول مفقودة');
    }
    const updates: any = {};
    if (firstName) {
        if (validateName(firstName)) {
            updates.firstName = firstName;
        } else {
            throw new Error('الاسم الأول غير صالح');
        }
    }
    if (lastName) {
        if (validateName(lastName)) {
            updates.lastName = lastName;
        } else {
            throw new Error('اسم العائلة غير صالح');
        }
    }
    const user = await Users.findOne({ _id: userId }).select('').lean();
    if (!user) {
        throw new Error('المستخدم غير موجود');
    }
    try {
        await Users.updateOne({ _id: userId }, { $set: { ...updates, updated_at: new Date() } });
    } catch (error) {
        logs.log(error);
        throw new Error('فشل تغيير الاسم');
    }
}

export const changeAvatar = async (userId: string, avatarId?: string) => {
    if (!avatarId) {
        throw new Error('حقول مفقودة');
    }
    const userDb = await Users.findOne({ _id: userId }).select('avatar profileUpdates').lean();
    if (!userDb) {
        throw new Error('المستخدم غير موجود');
    }
    try {
        // Remove old avatar file from the upload folder
        const avatar = `${environment.HOST}/a/${avatarId}`;
        await Users.updateOne({ _id: userId }, { $set: { avatar, "profileUpdates.lastUpdateAt": new Date(), updated_at: new Date() }, $inc: { "profileUpdates.updates": 1 } });
        return avatar;
    } catch (error) {
        logs.log(error);
        fs.unlinkSync(path.join(__dirname, `../../uploads/${avatarId}`));
        throw new Error('فشل تحديث الصورة الرمزية');
    }
}
