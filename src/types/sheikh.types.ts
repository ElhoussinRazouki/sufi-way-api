import * as Yup from "yup";


// for getting list
export const SheikhDtoSchema = Yup.object().shape({
    name: Yup.string().required(),
    avatar: Yup.string().optional(),
    bio: Yup.string().optional()
}); 

// for creating new one
export const SheikhDtoCreatePayload = SheikhDtoSchema;

// for updating
export const SheikhDtoPatchPayload = Yup.object().shape({
    id: Yup.string().required(),
    name: Yup.string().optional(),
    avatar: Yup.string().optional(),
    bio: Yup.string().optional()
});