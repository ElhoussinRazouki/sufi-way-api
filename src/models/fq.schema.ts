import { Schema, model } from 'mongoose';

const FQSchema = new Schema({
    question: { type: String, required: true },
    response: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export const FQ = model('FQ', FQSchema);
