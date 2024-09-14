import path from "path";
import { Author, MultiMedia } from "../models/multimedia.schema";
import { MultiMediaDtoCreatePayload, MultiMediaDtoListPayload, MultiMediaDtoPatchPayload, MultiMediaType } from "../types/multimedia.types";
import { formattingAttachmentUrl, logs } from "../utils";


export async function getMultiMediaList(filters: { type?: MultiMediaType, page?: string, limit?: string, search?: string, sort?: "asc" | "desc" }) {

    await MultiMediaDtoListPayload.validate(filters);
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 20;

    const skip = (page - 1) * limit;
    const conditions: any = {};
    if (filters.type) {
        conditions['type'] = filters.type;
    }
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
        const multiMediaList = await MultiMedia.find(conditions).sort(sort).skip(skip).limit(limit).populate({
            path: 'author_id',
            model: Author,
            select: '_id name avatar bio',
        })
            .lean();
        multiMediaList.forEach((multiMedia) => {
            multiMedia.url = formattingAttachmentUrl(multiMedia.url);
        });
        const total = await MultiMedia.countDocuments(conditions);
        return { data: multiMediaList, page, limit, total };
    } catch (error) {
        logs.error("Error: Multimedia, get : ", filters, error);
        throw new Error('Error while fetching multimedia');
    }
}

export async function getMultiMediaById(multimediaId: string) {
    try {
        const multiMedia = await MultiMedia.findById(multimediaId).populate({
            path: 'author_id',
            model: Author,
            select: '_id name avatar bio', 
          }).lean();
        return multiMedia;

    } catch (error) {
        logs.error("Error: Multimedia, getById : ", multimediaId, error);
        throw new Error('Error while fetching multimedia');
    }
}

export async function createMultiMedia(multimediaPayload: { title: string, description?: string, url: string, type: MultiMediaType }) {
    await MultiMediaDtoCreatePayload.validate(multimediaPayload);
    try {
        const newMultiMedia = await (await MultiMedia.create(multimediaPayload)).populate({
            path: 'author_id',
            model: Author,
            select: '_id name avatar bio', 
          })

        return newMultiMedia.toJSON();
    } catch (error) {
        logs.error("Error: Multimedia, create : ", multimediaPayload, error);
        throw new Error('Error while creating multimedia');
    }
}

export async function updateMultiMedia(multimediaId: string, multimediaPayload: { title: string, description?: string, url: string }) {

    await MultiMediaDtoPatchPayload.validate({ multimediaId, ...multimediaPayload });

    // check if there is any update
    if (Object.keys(multimediaPayload).length === 0) {
        throw new Error('at least one change is required to apply the update.');
    }
    try {
        // update then check if the update applies to some one return true else return false
        const updatedMultiMedia = await MultiMedia.findByIdAndUpdate(multimediaId, {...multimediaPayload, updated_at: new Date()}, { new: true }).populate({
            path: 'author_id',
            model: Author,
            select: '_id name avatar bio', 
          });

        return updatedMultiMedia?.toJSON();
    } catch (error) {
        logs.error("Error: Multimedia, update : ", multimediaId, multimediaPayload, error);
        throw new Error('Error while updating multimedia');
    }
}

export async function deleteMultiMedia(multimediaId: string) {
    try {
        const deletedMultiMedia = await MultiMedia.findByIdAndDelete(multimediaId).populate({
            path: 'author_id',
            model: Author,
            select: '_id name avatar bio', 
          });
        return deletedMultiMedia?.toJSON();
    } catch (error) {
        logs.error("Error: Multimedia, delete : ", multimediaId, error);
        throw new Error('Error while deleting multimedia');
    }
}