import { Schema, model } from 'mongoose';

const NewsSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

NewsSchema.index({ title: 1 });

export const News = model('News', NewsSchema);
