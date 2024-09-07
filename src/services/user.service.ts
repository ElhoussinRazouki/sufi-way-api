import fs from "fs";
import path from "path";
import { Users } from "../models/user.schema"
import { comparePassword, hashPassword } from "../utils/hashing";
import { validateName, verifyPasswordStrength } from "../utils/string.format";
import { environment } from "../utils/loadEnvironment";
import { logs } from "../utils";


const MAX_POCKETS: any = { free: 5, beginner: 10, pro: 30, premium: 100, admin: 100 };
const MAX_POCKET_ITEMS: any = { free: 10, beginner: 20, pro: 100, premium: 100, admin: 100 };
const MAX_PROFILE_UPDATES = 5;

// platforms things
export const GP = "gp";
export const AS = "as";
export const ST = "st";
export const PLATFORMS = [GP, AS, ST];

// types 
export const APP = "app";
export const DEV = "dev";
export const KEYWORD = "key";
export const TYPES = [APP, DEV, KEYWORD];
export const OTP_TYPES = {
    changeEmail: {
        authorization: "change-email-authorization",
        request: "change-email-request",
        confirm: "change-email-confirm"
    },
    changePassword: "change-password",
    recoveryEmail: {
        authorization: "recovery-email-authorization",
        request: "recovery-email-request",
        confirm: "recovery-email-confirm"
    }
};


// manage user info
export const getProfile = async (_id: string) => {
    const user = await Users.findOne({ _id }).select("userName email plan avatar isVerified password recoveryEmail is2faActive firstName lastName").lean();
    if (!user) {
        throw new Error('user profile not found');
    }
    if (user.password) {
        delete user.password;
        return { ...user, havePassword: true };
    }
    return { ...user, havePassword: false };
    
}

export const changePassword = async (userId: string, oldPassword: string, newPassword: string, otp: number) => {
    if (!oldPassword || !newPassword || !otp) {
        throw new Error('missing fields');
    }
    const user = await Users.findOne({ _id: userId }).select('password').lean();
    if (!user) {
        throw new Error('user not found');
    }
    if (oldPassword === newPassword) throw new Error('new password cannot be the same as old password');
    if (!user) {
        throw new Error('user not found');
    }
    if (!await comparePassword(oldPassword, user.password as string)) {
        throw new Error('invalid password');
    }
    if (!verifyPasswordStrength(newPassword)) throw new Error("try a stronger password with at least 8 characters, one uppercase, one lowercase, one number and one special character");
    const hashedPassword = await hashPassword(newPassword);
    try {
        await Users.updateOne({ _id: userId }, { $set: { password: hashedPassword,  updated_at: new Date() } });
    } catch (error) {
        logs.log(error);
        throw new Error('password change failed');
    }
}

export const changeName = async (userId: string, firstName: string, lastName: string) => {
    if (!firstName && !lastName) {
        throw new Error('missing fields');
    }
    const updates: any = {};
    if (firstName) {
        if (validateName(firstName)) {
            updates.firstName = firstName;
        } else {
            throw new Error('invalid first name')
        }
    }
    if (lastName) {
        if (validateName(lastName)) {
            updates.lastName = lastName;
        } else {
            throw new Error('invalid last name')
        }
    }
    const user = await Users.findOne({ _id: userId }).select('').lean();
    if (!user) {
        throw new Error('user not found');
    }
    try {
        await Users.updateOne({ _id: userId }, { $set: { ...updates, updated_at: new Date() }});
    } catch (error) {
        logs.log(error);
        throw new Error('name change failed');
    }
}

export const changeAvatar = async (userId: string, avatarId?: string) => {
    if (!avatarId) {
        throw new Error('missing fields');
    }
    const userDb = await Users.findOne({ _id: userId }).select('avatar profileUpdates').lean();
    if (!userDb) {
        throw new Error('user not found');
    }
    try {
        // Remove old avatar file from the upload folder

        const avatar = `${environment.HOST}/a/${avatarId}`;
        await Users.updateOne({ _id: userId }, { $set: { avatar, "profileUpdates.lastUpdateAt": new Date(), updated_at: new Date() }, $inc: { "profileUpdates.updates": 1 } });
        return avatar;

    } catch (error) {
        logs.log(error);
        fs.unlinkSync(path.join(__dirname, `../../uploads/${avatarId}`));
        throw new Error('avatar update failed');
    }
}
