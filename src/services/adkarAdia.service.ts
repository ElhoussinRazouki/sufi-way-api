import { AdkarAdia } from "../models/adkar-adia.schema";
import { AdkarAdiaDtoCreatePayload, AdkarAdiaDtoPatchPayload, AdkarAdiaType } from "../types/adkar-adia.types";
import { logs } from "../utils";

async function list(filters: { page?: string, limit?: string, title?: string, type?: AdkarAdiaType, sort?: "asc" | "desc" }) {
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;

    const skip = (page - 1) * limit;
    const conditions: any = {};
    if (filters.title) {
        conditions['title'] = { $regex: filters.title, $options: 'i' };
    }
    if (filters.type) {
        conditions['type'] = filters.type;
    }
    const sort: { created_at?: "asc" | "desc" } = {}
    if (filters.sort) {
        sort['created_at'] = filters.sort;
    }

    if (limit > 100) {
        throw new Error('لا يمكن أن يتجاوز الحد 100');
    }

    try {
        const list = await AdkarAdia.find(conditions).sort(sort).skip(skip).limit(limit).select("title content type created_at").lean();
        const total = await AdkarAdia.countDocuments(conditions);
        return { data: list, page, limit, total };
    } catch (error) {
        logs.error("Error: Adkar Adia, get : ", filters, error);
        throw new Error('خطأ أثناء جلب الأذكار والأدعية');
    }
}

async function details(id: string) {
    try {
        const details = await AdkarAdia.findById(id).select("title content type created_at updated_at").lean();
        return details;
    } catch (error) {
        logs.error("Error: Adkar Adia, getById : ", id, error);
        throw new Error('خطأ أثناء جلب الأذكار والأدعية');
    }
}

async function create(payload: { title: string, type: AdkarAdiaType, content: string[] }) {
    await AdkarAdiaDtoCreatePayload.validate(payload);
    try {
        const newRecord = await AdkarAdia.create(payload);
        return newRecord.toJSON();
    } catch (error) {
        logs.error("Error: Adkar Adia, create : ", payload, error);
        throw new Error('خطأ أثناء إنشاء الأذكار والأدعية');
    }
}

async function update(id: string, payload: { title?: string, type?: AdkarAdiaType, content?: string[] }) {
    await AdkarAdiaDtoPatchPayload.validate({ id, ...payload });

    // check if there is any update
    if (Object.keys(payload).length === 0) {
        throw new Error('تغيير واحد على الأقل مطلوب لتطبيق التحديث.');
    }
    try {
        const UpdatedRecord = await AdkarAdia.findByIdAndUpdate(id, { ...payload, updated_at: new Date() }, { new: true }).select("title content type created_at");
        return UpdatedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Adkar Adia, update : ", id, payload, error);
        throw new Error('خطأ أثناء تحديث الأذكار والأدعية');
    }
}

async function remove(id: string) {
    try {
        const removedRecord = await AdkarAdia.findByIdAndDelete(id);
        return removedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Adkar Adia, delete : ", id, error);
        throw new Error('خطأ أثناء حذف الأذكار والأدعية');
    }
}

const AdkarAdiaService = {
    list,
    details,
    create,
    update,
    remove
}

export default AdkarAdiaService;
