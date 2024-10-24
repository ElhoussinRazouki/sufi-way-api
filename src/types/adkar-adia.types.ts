import * as Yup from "yup";
import { ADKAR_ADIA_TYPES } from "../constants";

export type AdkarAdiaType = typeof ADKAR_ADIA_TYPES[number];

// for getting list
export const AdkarAdiaDtoSchema = Yup.object().shape({
    title: Yup.string().required('العنوان مطلوب'),
    type: Yup.string().oneOf(ADKAR_ADIA_TYPES).required("النوع مطلوب"),
    content: Yup.array().of(Yup.string()).min(1, 'مطلوب على الأقل واحد').required('المحتوى مطلوب')
}); 

// for creating new
export const AdkarAdiaDtoCreatePayload = AdkarAdiaDtoSchema;

// for updating adkar adia
export const AdkarAdiaDtoPatchPayload = Yup.object().shape({
    id: Yup.string().required('المعرف مطلوب'),
    title: Yup.string().optional(),
    type : Yup.string().oneOf(ADKAR_ADIA_TYPES).optional(),
    content: Yup.array().of(Yup.string()).min(1, 'مطلوب على الأقل رابط واحد').optional(),
});
