import { Users } from "../models/user.schema";
import { NoteDtoCreatePayload, NoteDtoPatchPayload } from "../types/note.types";
import { logs } from "../utils";

export async function getUserNotes(userId: string) {
    if (!userId) throw new Error('معرّف المستخدم مطلوب');

    try {
        const userDb = await Users.findOne({ _id: userId }).select('notes').lean();
        if (userDb) return userDb.notes;
        return null;
    } catch (error) {
        logs.error("Error: User, getNotes : ", userId, error);
        throw new Error('خطأ أثناء جلب ملاحظات المستخدم');
    }
}

export async function createUserNote(userId: string, payload: { title: string, description?: string }) {
    await NoteDtoCreatePayload.validate({ ...payload, userId });

    try {
        const result = await Users.updateOne({ _id: userId }, { $push: { notes: payload } });
        if (result.modifiedCount) {
            return payload;
        }
        return null;
    } catch (error) {
        logs.error("Error: User, createNote : ", userId, payload, error);
        throw new Error('خطأ أثناء إنشاء الملاحظة');
    }
}

export async function deleteUserNote(userId: string, noteId: string) {
    if (!userId || !noteId) throw new Error('معرّف المستخدم ومعرّف الملاحظة مطلوبان');

    try {
        const result = await Users.updateOne({ _id: userId }, { $pull: { notes: { _id: noteId } } });
        if (result.modifiedCount) {
            return noteId;
        }
        return null;
    } catch (error) {
        logs.error("Error: User, deleteNote : ", userId, noteId, error);
        throw new Error('خطأ أثناء حذف الملاحظة');
    }
}

export async function updateUserNote(userId: string, noteId: string, payload: { title?: string, description?: string, content?: string }) {
    await NoteDtoPatchPayload.validate({ ...payload, userId, noteId });

    // check payload length
    if (Object.keys(payload).length === 0) {
        throw new Error('يجب إجراء تغيير واحد على الأقل ليتم اعتباره تحديثًا');
    }

    const patch: any = { "notes.$.updated_at": new Date() };
    if (payload.title) patch["notes.$.title"] = payload.title;
    if (payload.description) patch["notes.$.description"] = payload.description;
    if (payload.content) patch["notes.$.content"] = payload.content;

    try {
        const result = await Users.updateOne({ _id: userId, "notes._id": noteId }, { $set: patch });
        if (result.modifiedCount) {
            return payload;
        }
        return null;
    } catch (error) {
        logs.error("Error: User, updateNote : ", userId, noteId, payload, error);
        throw new Error('خطأ أثناء تحديث الملاحظة');
    }
}
