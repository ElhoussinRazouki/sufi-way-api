import { Zawya } from "../models/zawya.schema";
import { ZawyaDtoCreatePayload, ZawyaDtoPatchPayload } from "../types/zawya.types";
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
        const list = await Zawya.find(conditions).sort(sort).skip(skip).limit(limit).lean();
        const total = await Zawya.countDocuments(conditions);
        return { data: list, page, limit, total };
    } catch (error) {
        logs.error("Error: Zawya, get : ", filters, error);
        throw new Error('خطأ أثناء جلب القائمة');
    }
}

async function details(id: string) {
    try {
        const details = await Zawya.findById(id).lean();
        return details;
    } catch (error) {
        logs.error("Error: zawya, getById : ", id, error);
        throw new Error('خطأ أثناء جلب التفاصيل');
    }
}

async function create(payload: { name: string, avatar?: string, bio: string }) {
    await ZawyaDtoCreatePayload.validate(payload);
    try {
        const newRecord = await Zawya.create(payload);
        return newRecord.toJSON();
    } catch (error) {
        logs.error("Error: Zawya, add : ", payload, error);
        throw new Error('خطأ أثناء إضافة المعلومات');
    }
}

async function update(id: string, payload: { name?: string, avatar?: string, bio?: string }) {
    await ZawyaDtoPatchPayload.validate({ id, ...payload });

    // check if there is any update
    if (Object.keys(payload).length === 0) {
        throw new Error('تغيير واحد على الأقل مطلوب لتطبيق التحديث.');
    }
    try {
        const UpdatedRecord = await Zawya.findByIdAndUpdate(id, { ...payload, updated_at: new Date() }, { new: true });
        return UpdatedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Zawya, update : ", id, payload, error);
        throw new Error('خطأ أثناء تحديث المعلومات');
    }
}

async function remove(id: string) {
    try {
        const removedRecord = await Zawya.findByIdAndDelete(id);
        return removedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Zawya, delete : ", id, error);
        throw new Error('خطأ أثناء إزالة المعلومات');
    }
}

const ZawyaService = {
    list,
    details,
    create,
    update,
    remove
}

export default ZawyaService;
