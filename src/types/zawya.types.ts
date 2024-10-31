import * as Yup from "yup";


// for getting list
export const ZawyaDtoSchema = Yup.object().shape({
    name: Yup.string().required(),
    avatar: Yup.string().optional(),
    bio: Yup.string().optional()
}); 

// for creating new one
export const ZawyaDtoCreatePayload = ZawyaDtoSchema;

// for updating
export const ZawyaDtoPatchPayload = Yup.object().shape({
    id: Yup.string().required(),
    name: Yup.string().optional(),
    avatar: Yup.string().optional(),
    bio: Yup.string().optional()
});