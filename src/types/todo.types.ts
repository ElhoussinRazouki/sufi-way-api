import * as Yup from "yup";

// for getting list
export const TodoDtoListPayload = Yup.object().shape({
    page: Yup.number().optional(),
    limit: Yup.number().optional(),
    search: Yup.string().optional(),
    sort: Yup.string().oneOf(["asc", "desc"]).optional()
}); 

// for creating new Todo
export const TodoDtoCreatePayload = Yup.object().shape({
    title: Yup.string().required(),
});

// for updating Todo
export const TodoDtoPatchPayload = Yup.object().shape({
    id: Yup.string().required(),
    title: Yup.string().optional(),
    checked: Yup.boolean().optional(),
});