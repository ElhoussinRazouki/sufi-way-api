import { Schema, model } from 'mongoose';

const ZawyaSchema = new Schema({
    name: { type: String, required: true },
    avatar: String,
    bio: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});


export const Zawya = model('Zawya', ZawyaSchema);