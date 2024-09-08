import path from "path";
import { MultiMedia } from "../models/multimedia.schema";
import { MultiMediaDtoCreatePayload, MultiMediaDtoListPayload, MultiMediaDtoPatchPayload, MultiMediaType } from "../types/multimedia.types";
import { environment } from "../utils/loadEnvironment";
import { formattingAttachmentUrl, logs } from "../utils";


export async function getMultiMediaList(filters: { type: MultiMediaType, page?: number, limit?: number, search?: string, sort?: "asc" | "desc" }) {

    await MultiMediaDtoListPayload.validate(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const skip = (page - 1) * limit;
    const conditions: any = { type: filters.type };
    if(filters.search){
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
        const multiMediaList = await MultiMedia.find(conditions).sort(sort).skip(skip).limit(limit).lean();
        multiMediaList.forEach((multiMedia) => {
            multiMedia.url = formattingAttachmentUrl(multiMedia.url);
        });
        return multiMediaList;
    } catch (error) {
        logs.error("Error: Multimedia, get : ", filters, error);
        throw new Error('Error while fetching multimedia');
    }
}

export async function getMultiMediaById(multimediaId: string) {
    try {
        const multiMedia = await MultiMedia.findById(multimediaId).lean();
        if (multiMedia) {
            return { ...multiMedia, url: formattingAttachmentUrl(multiMedia.url) };
        }
        return null;
    } catch (error) {
        logs.error("Error: Multimedia, getById : ", multimediaId, error);
        throw new Error('Error while fetching multimedia');
    }
}

export async function createMultiMedia(multimediaPayload: { title: string, description?: string, url: string, type: MultiMediaType }) {
    await MultiMediaDtoCreatePayload.validate(multimediaPayload);
    try {
        const newMultiMedia = await MultiMedia.create(multimediaPayload);
        return { ...newMultiMedia, url: formattingAttachmentUrl(newMultiMedia.url) };
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
        const updatedMultiMedia = await MultiMedia.findByIdAndUpdate(multimediaId, multimediaPayload, { new: true });
        if (updatedMultiMedia) {
            return {...updatedMultiMedia, url: formattingAttachmentUrl(updatedMultiMedia.url)};
        }
        return null;
    } catch (error) {
        logs.error("Error: Multimedia, update : ", multimediaId, multimediaPayload, error);
        throw new Error('Error while updating multimedia');
    }
}

export async function deleteMultiMedia(multimediaId: string) {
    try {
        const deletedMultiMedia = await MultiMedia.findByIdAndDelete(multimediaId);
        return deletedMultiMedia;
    } catch (error) {
        logs.error("Error: Multimedia, delete : ", multimediaId, error);
        throw new Error('Error while deleting multimedia');
    }
}