import * as Yup from "yup";

export const NoteDtoCreatePayload = Yup.object().shape({
    title: Yup.string().required(),
    content: Yup.string().optional(),
    userId: Yup.string().required(),
});

export const NoteDtoPatchPayload = Yup.object().shape({
    noteId: Yup.string().required(),
    title: Yup.string().optional(),
    content: Yup.string().optional(),
    userId: Yup.string().required()
});