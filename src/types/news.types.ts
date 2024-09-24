import * as Yup from "yup";


// for getting list
export const NewsDtoSchema = Yup.object().shape({
    title: Yup.string().required(),
    description: Yup.string().required(),
    url: Yup.string().required()
}); 

// for creating new one
export const NewsDtoCreatePayload = NewsDtoSchema;

// for updating multimedia
export const NewsDtoPatchPayload = Yup.object().shape({
    id: Yup.string().required(),
    title: Yup.string().optional(),
    description: Yup.string().optional(),
    url: Yup.string().optional(),
});