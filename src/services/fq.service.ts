import { FQ } from "../models/fq.schema";
import { FQDtoCreatePayload, FQDtoPatchPayload } from "../types/fq.types";
import { logs } from "../utils";


async function list(filters: { page?: string, limit?: string, sort?: "asc" | "desc" }) {

    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;

    const skip = (page - 1) * limit;
    
    const conditions: any = {};
    const sort: { created_at?: "asc" | "desc" } = {}
    if (filters.sort) {
        sort['created_at'] = filters.sort;
    }

    if (limit > 100) {
        throw new Error('limit cannot exceed 100');
    }

    try {
        const list = await FQ.find(conditions).sort(sort).skip(skip).limit(limit).select("question response").lean();
        const total = await FQ.countDocuments(conditions);
        return { data: list, page, limit, total };
    } catch (error) {
        logs.error("Error: frequent questions, get : ", filters, error);
        throw new Error('Error while fetching frequent questions');
    }
}

async function details(id: string) {
    try {
        const details = await FQ.findById(id).lean();
        return details;
    } catch (error) {
        logs.error("Error: frequent questions, getById : ", id, error);
        throw new Error('Error while fetching frequent questions');
    }
}

async function create(payload: { question: string, response: string, bio: string }) {
    await FQDtoCreatePayload.validate(payload);
    try {
        const newRecord = await FQ.create(payload);
        return newRecord.toJSON();
    } catch (error) {
        logs.error("Error: frequent questions, create : ", payload, error);
        throw new Error('Error while creating frequent questions');
    }
}

async function update(id: string, payload: { question?: string, response?: string }) {

    await FQDtoPatchPayload.validate({ id, ...payload });

    // check if there is any update
    if (Object.keys(payload).length === 0) {
        throw new Error('at least one change is required to apply the update.');
    }
    try {
        // update then check if the update applies to some one return true else return false
        const UpdatedRecord = await FQ.findByIdAndUpdate(id, { ...payload, updated_at: new Date() }, { new: true });
        return UpdatedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: frequent questions, update : ", id, payload, error);
        throw new Error('Error while updating frequent questions');
    }
}

async function remove(id: string) {
    try {
        const removedRecord = await FQ.findByIdAndDelete(id);
        return removedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: frequent questions, delete : ", id, error);
        throw new Error('Error while deleting frequent questions');
    }
}

const FQService = {
    list,
    details,
    create,
    update,
    remove
}

export default FQService;