import { Schema, model } from 'mongoose';
import { FAVORITES_TYPES } from '../constants';


const NoteSchema = new Schema({
    title: String,
    content: {
        type: String,
        default: ""
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const FavoriteSchema = new Schema({
    type: { type: String, enum: FAVORITES_TYPES, required: true },
    refId: { type: Schema.Types.ObjectId, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

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
    accessToken: String,
    refreshToken: {
        type: String,
        default: null
    },
    avatar: String,
    googleId: String,
    loginAttempts: {
        type: {
            attempts: Number,
            lastAttemptAt: Date
        },
        default: {
            attempts: 0,
            lastAttemptAt: Date.now()
        }
    },
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
    isAdmin: { type: Boolean, default: false },
    notes: { type: [NoteSchema], default: [] },
    lastTimeAskSheikh: { type: Date, default: null },
    lastTimeAskSupport: { type: Date, default: null },
    favorites: { type: [FavoriteSchema], default: [] },
    removed_at: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ refreshToken: 1 });


export const Users = model('User', UserSchema);