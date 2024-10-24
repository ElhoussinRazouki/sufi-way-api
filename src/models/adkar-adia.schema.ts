import { Schema, model } from 'mongoose';

const AdkarAdiaSchema = new Schema({
    title: { type: String, required: true },
    content: { type: [String], required: true, default: [] },
    type: {
        type: String,
        enum: ["adkar", "doaa"],
        required: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});


AdkarAdiaSchema.index({});

export const AdkarAdia = model('Adkar-Adia', AdkarAdiaSchema);
