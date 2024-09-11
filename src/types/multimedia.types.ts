import * as Yup from "yup";
import { MULTIMEDIA_TYPES } from "../constants"

// generate type based on array of strings
export type MultiMediaType = typeof MULTIMEDIA_TYPES[number];

// for getting list
export const MultiMediaDtoListPayload = Yup.object().shape({
    page: Yup.number().optional(),
    limit: Yup.number().optional(),
    type: Yup.string().oneOf(MULTIMEDIA_TYPES).optional(),
    search: Yup.string().optional(),
    sort: Yup.string().oneOf(["asc", "desc"]).optional()
}); 

// for creating new multimedia
export const MultiMediaDtoCreatePayload = Yup.object().shape({
    title: Yup.string().required(),
    description: Yup.string().optional(),
    url: Yup.string().required(),
    type: Yup.string().oneOf(MULTIMEDIA_TYPES).required()
});

// for updating multimedia
export const MultiMediaDtoPatchPayload = Yup.object().shape({
    multimediaId: Yup.string().required(),
    title: Yup.string().optional(),
    description: Yup.string().optional(),
    url: Yup.string().optional()
});