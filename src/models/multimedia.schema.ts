import { Schema, model } from 'mongoose';

const SheikhSchema = new Schema({
    name: { type: String, required: true },
    avatar: String,
    bio: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const AuthorSchema = new Schema({
    name: { type: String, required: true },
    avatar: String,
    bio: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const MultiMediaSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    author_id: { type: Schema.Types.ObjectId, ref: 'Author' },
    thumbnail: { type: String },
    type: {
        type: String,
        enum: ["video", "audio", "pdf"],
        required: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

MultiMediaSchema.index({ type: 1 });
MultiMediaSchema.index({ author_id: 1 });
MultiMediaSchema.index({ title: 1 });

export const MultiMedia = model('MultiMedia', MultiMediaSchema);
export const Author = model('Author', AuthorSchema);
export const Sheikh = model('Sheikh', SheikhSchema);