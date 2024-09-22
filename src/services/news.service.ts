import { Author } from "../models/multimedia.schema";
import { News } from "../models/news.schema";
import { AuthorDtoCreatePayload, AuthorDtoPatchPayload } from "../types/author.types";
import { logs } from "../utils";


async function list(filters: { page?: string, limit?: string, search?: string, sort?: "asc" | "desc" }) {

    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;

    const skip = (page - 1) * limit;
    const conditions: any = {};
    if (filters.search) {
        conditions['title'] = { $regex: filters.search, $options: 'i' };
    }
    const sort: { created_at?: "asc" | "desc" } = {}
    if (filters.sort) {
        sort['created_at'] = filters.sort;
    }

    if (limit > 100) {
        throw new Error('limit cannot exceed 100');
    }

    try {
        const list = await News.find(conditions).sort(sort).skip(skip).limit(limit).lean();
        const total = await News.countDocuments(conditions);
        return { data: list, page, limit, total };
    } catch (error) {
        logs.error("Error: News, get : ", filters, error);
        throw new Error('Error while fetching News');
    }
}

async function details(id: string) {
    try {
        const details = await News.findById(id).lean();
        return details;
    } catch (error) {
        logs.error("Error: News, getById : ", id, error);
        throw new Error('Error while fetching News');
    }
}

async function create(payload: { title: string, description: string, url: string }) {
    await AuthorDtoCreatePayload.validate(payload);
    try {
        const newRecord = await Author.create(payload);
        return newRecord.toJSON();
    } catch (error) {
        logs.error("Error: Author, create : ", payload, error);
        throw new Error('Error while creating author');
    }
}

async function update(id: string, payload: { name?: string, avatar?: string, bio?: string }) {

    await AuthorDtoPatchPayload.validate({ id, ...payload });

    // check if there is any update
    if (Object.keys(payload).length === 0) {
        throw new Error('at least one change is required to apply the update.');
    }
    try {
        // update then check if the update applies to some one return true else return false
        const UpdatedRecord = await Author.findByIdAndUpdate(id, { ...payload, updated_at: new Date() }, { new: true });
        return UpdatedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Author, update : ", id, payload, error);
        throw new Error('Error while updating author');
    }
}

async function remove(id: string) {
    try {
        const removedRecord = await Author.findByIdAndDelete(id);
        return removedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Author, delete : ", id, error);
        throw new Error('Error while deleting Author');
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