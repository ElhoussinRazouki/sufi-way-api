import { Schema, model } from 'mongoose';

const TodoSchema = new Schema({
    title: String,
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    checked: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

TodoSchema.index({ title: 1 });
TodoSchema.index({ user_id: 1 });

export const Todo = model('Todo', TodoSchema);
