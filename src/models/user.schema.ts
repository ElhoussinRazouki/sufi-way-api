import { Schema, model } from 'mongoose';


const UserSchema = new Schema({
    userName: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: Number,
    is2faActive: {
        type: Boolean,
        default: false
    },
    accessToken: String,
    refreshToken: String,
    avatar: String,
    googleId: String,
    ipRegisteredWith: String,
    plan: {
        type: String,
        default: "free"
    },
    status: {
        type: Boolean,
        default: true
    },
    resetPasswordAttempts: {
        type: {
            attempts: { type: Number, default: 0 },
            lastAttemptAt: { type: Date, default: null },
        },
        default: {
            attempts: 0,
            lastAttemptAt: null
        }
    },
    removed_at: Date,
    created_at: { type: Date, default: Date.now},
    updated_at: { type: Date, default: Date.now}
});


export const Users = model('User', UserSchema);