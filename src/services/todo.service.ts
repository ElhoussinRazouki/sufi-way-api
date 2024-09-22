import { Todo } from "../models/todo.schema";
import { TodoDtoCreatePayload, TodoDtoPatchPayload } from "../types/todo.types";
import { logs } from "../utils";


async function list(userId: string, filters: { page?: string, limit?: string, search?: string, sort?: "asc" | "desc" }) {

    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;

    const skip = (page - 1) * limit;
    const conditions: any = { user_id: userId };
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
        const list = await Todo.find(conditions).sort(sort).skip(skip).limit(limit).select("_id title checked created_at updated_at").lean();
        const total = await Todo.countDocuments(conditions);
        return { data: list, page, limit, total };
    } catch (error) {
        logs.error("Error: Todo, get : ", filters, error);
        throw new Error('Error while fetching Todo');
    }
}


async function create(userId: string, payload: { name: string }) {
    await TodoDtoCreatePayload.validate(payload);
    try {
        const newRecord = (await Todo.create({ user_id: userId, ...payload}));
        return newRecord.toJSON();
    } catch (error) {
        logs.error("Error: Todo, create : ", payload, error);
        throw new Error('Error while creating Todo');
    }
}

async function update(userId: string, id: string, payload: { title?: string, checked?: boolean }) {

    await TodoDtoPatchPayload.validate({ id, ...payload });

    // check if there is any update
    if (Object.keys(payload).length === 0) {
        throw new Error('at least one change is required to apply the update.');
    }
    try {
        // update then check if the update applies to some one return true else return false
        const UpdatedRecord = await Todo.findOneAndUpdate({ user_id: userId, _id: id }, { ...payload, updated_at: new Date() }, { new: true }).select("_id title checked created_at updated_at");
        return UpdatedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Todo, update : ", id, payload, error);
        throw new Error('Error while updating Todo');
    }
}

async function remove(id: string, userId: string) {
    try {
        const removedRecord = await Todo.findOneAndDelete({ _id: id, user_id: userId });
        return removedRecord?.toJSON();
    } catch (error) {
        logs.error("Error: Todo, delete : ", id, error);
        throw new Error('Error while deleting Todo');
    }
}

const TodoService = {
    list,
    create,
    update,
    remove
}

export default TodoService;