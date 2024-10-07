import * as Yup from "yup";

// for getting list
export const NewsDtoSchema = Yup.object().shape({
    title: Yup.string().required('العنوان مطلوب'),
    description: Yup.string().required('الوصف مطلوب'),
    url: Yup.array().of(Yup.string()).min(1, 'مطلوب على الأقل رابط واحد').required('الروابط مطلوبة')
}); 

// لإنشاء جديد
export const NewsDtoCreatePayload = NewsDtoSchema;

// لتحديث الوسائط المتعددة
export const NewsDtoPatchPayload = Yup.object().shape({
    id: Yup.string().required('المعرف مطلوب'),
    title: Yup.string().optional(),
    description: Yup.string().optional(),
    url: Yup.array().of(Yup.string()).min(1, 'مطلوب على الأقل رابط واحد').optional(),
});
