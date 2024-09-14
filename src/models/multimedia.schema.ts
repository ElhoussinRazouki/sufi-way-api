import { Schema, model } from 'mongoose';

const AuthorSchema = new Schema({
    name: String,
    avatar: String,
    bio: String,
    created_at: { type: Date, default: Date.now},
    updated_at: { type: Date, default: Date.now}
});

const MultiMediaSchema = new Schema({
    title: String,
    description: {
        type: String,
        default: ""
    },
    url: { type: String, required: true },
    author_id: { type: Schema.Types.ObjectId, ref: 'Author' },
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
export const Author = model('Author', AuthorSchema);