import { News } from "../models/news.schema";
import { NewsDtoCreatePayload, NewsDtoPatchPayload } from "../types/news.types";
import { logs } from "../utils";

async function list(filters: { page?: string, limit?: string, title?: string, sort?: "asc" | "desc" }) {
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;

    const skip = (page - 1) * limit;
    const conditions: any = {};
    if (filters.title) {
        conditions['title'] = { $regex: filters.title, $options: 'i' };
    }
    const sort: { created_at?: "asc" | "desc" } = {}
    if (filters.sort) {
        sort['created_at'] = filters.sort;
    }

    if (limit > 100) {
        throw new Error('لا يمكن أن يتجاوز الحد 100');
    }

    try {
        const list = await News.find(conditions).sort(sort).skip(skip).limit(limit).select("title description url created_at").lean();
        const total = await News.countDocuments(conditions);
        return { data: list, page, limit, total };
    } catch (error) {
        logs.error("Error: News, get : ", filters, error);
        throw new Error('خطأ أثناء جلب الأخبار');
    }
}

async function details(id: string) {
    try {
        const details = await News.findById(id).select("title description url created_at updated_at").lean();
        return details;
    } catch (error) {
        logs.error("Error: News, getById : ", id, error);
        throw new Error('خطأ أثناء جلب الأخبار');
    }
}

async function create(payload: { title: string, description: string, url: string }) {
    await NewsDtoCreatePayload.validate(payload);
    try {
        const newRecord = await News.create(payload);
        return newRecord.toJSON();
    } catch (error) {
        logs.error("Error: News, create : ", payload, error);
        throw new Error('خطأ أثناء إنشاء الأخبار');
    }
}

async function update(id: string, payload: { title?: string, description?: string, url?: string }) {
    await NewsDtoPatchPayload.validate({ id, ...payload });

    // check if there is any update
    if (Object.keys(payload).length === 0) {
        throw new Error('تغيير واحد على الأقل مطلوب لتطبيق التحديث.');
    }
    try {
        const UpdatedRecord = await News.findByIdAndUpdate(id, { ...payload, updated_at: new Date() }, { new: true }).select("title description url created_at");
        return UpdatedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: News, update : ", id, payload, error);
        throw new Error('خطأ أثناء تحديث الأخبار');
    }
}

async function remove(id: string) {
    try {
        const removedRecord = await News.findByIdAndDelete(id);
        return removedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: News, delete : ", id, error);
        throw new Error('خطأ أثناء حذف الأخبار');
    }
}

const AuthorService = {
    list,
    details,
    create,
    update,
    remove
}

export default AuthorService;
