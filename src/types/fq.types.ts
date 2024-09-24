import * as Yup from "yup";


// for getting list
export const FQDtoSchema = Yup.object().shape({
    question: Yup.string().required(),
    response: Yup.string().required(),
}); 

// for creating new one
export const FQDtoCreatePayload = FQDtoSchema;

// for updating multimedia
export const FQDtoPatchPayload = Yup.object().shape({
    id: Yup.string().required(),
    question: Yup.string().optional(),
    response: Yup.string().optional()
});