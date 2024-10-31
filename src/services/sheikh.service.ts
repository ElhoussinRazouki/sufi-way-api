import { Sheikh } from "../models/multimedia.schema";
import { SheikhDtoCreatePayload, SheikhDtoPatchPayload } from "../types/sheikh.types";
import { logs } from "../utils";

async function list(filters: { page?: string, limit?: string, name?: string, sort?: "asc" | "desc" }) {
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;

    const skip = (page - 1) * limit;

    const conditions: any = {};
    if (filters.name) {
        conditions['name'] = { $regex: filters.name, $options: 'i' };
    }
    const sort: { created_at?: "asc" | "desc" } = {}
    if (filters.sort) {
        sort['created_at'] = filters.sort;
    }

    if (limit > 100) {
        throw new Error('لا يمكن أن يتجاوز الحد 100');
    }

    try {
        const list = await Sheikh.find(conditions).sort(sort).skip(skip).limit(limit).lean();
        const total = await Sheikh.countDocuments(conditions);
        return { data: list, page, limit, total };
    } catch (error) {
        logs.error("Error: Sheikhs, get list : ", filters, error);
        throw new Error('خطأ أثناء جلب قائمة الشيوخ');
    }
}

async function details(id: string) {
    try {
        const details = await Sheikh.findById(id).lean();
        return details;
    } catch (error) {
        logs.error("Error: sheikhs, get details : ", id, error);
        throw new Error('خطأ أثناء جلب التفاصيل');
    }
}

async function create(payload: { name: string, avatar?: string, bio: string }) {
    await SheikhDtoCreatePayload.validate(payload);
    try {
        const newRecord = await Sheikh.create(payload);
        return newRecord.toJSON();
    } catch (error) {
        logs.error("Error: Sheikh, add : ", payload, error);
        throw new Error('خطأ أثناء إضافة المعلومات');
    }
}

async function update(id: string, payload: { name?: string, avatar?: string, bio?: string }) {
    await SheikhDtoPatchPayload.validate({ id, ...payload });

    // check if there is any update
    if (Object.keys(payload).length === 0) {
        throw new Error('تغيير واحد على الأقل مطلوب لتطبيق التحديث.');
    }
    try {
        const UpdatedRecord = await Sheikh.findByIdAndUpdate(id, { ...payload, updated_at: new Date() }, { new: true });
        return UpdatedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Sheikh, update : ", id, payload, error);
        throw new Error('خطأ أثناء تحديث المعلومات');
    }
}

async function remove(id: string) {
    try {
        const removedRecord = await Sheikh.findByIdAndDelete(id);
        return removedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Sheikh, delete : ", id, error);
        throw new Error('خطأ أثناء إزالة المعلومات');
    }
}

const SheikhService = {
    list,
    details,
    create,
    update,
    remove
}

export default SheikhService;
