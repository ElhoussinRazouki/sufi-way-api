import * as Yup from "yup";
import { MULTIMEDIA_TYPES } from "../constants"


// for getting list
export const AuthorDtoSchema = Yup.object().shape({
    name: Yup.string().required(),
    avatar: Yup.string().optional(),
    bio: Yup.string().optional()
}); 

// for creating new one
export const AuthorDtoCreatePayload = AuthorDtoSchema;

// for updating multimedia
export const AuthorDtoPatchPayload = Yup.object().shape({
    id: Yup.string().required(),
    name: Yup.string().optional(),
    avatar: Yup.string().optional(),
    bio: Yup.string().optional()
});