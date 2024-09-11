import { Schema, model } from 'mongoose';


const MultiMediaSchema = new Schema({
    title: String,
    description: {
        type: String,
        default: ""
    },
    url: { type: String, required: true },
    author: { type: String },
    thumbnail: { type: String },
    type: {
        type: String,
        enum: ["video", "audio", "pdf"],
        required: true
    },
    created_at: { type: Date, default: Date.now},
    updated_at: { type: Date, default: Date.now}
});

MultiMediaSchema.index({ type: 1 });

export const MultiMedia = model('MultiMedia', MultiMediaSchema);