import * as Yup from "yup";

export const NoteDtoCreatePayload = Yup.object().shape({
    userId: Yup.string().required(),
    title: Yup.string().required(),
    content: Yup.string().optional(),
});

export const NoteDtoPatchPayload = Yup.object().shape({
    userId: Yup.string().required(),
    noteId: Yup.string().required(),
    title: Yup.string().optional(),
    content: Yup.string().optional(),
});