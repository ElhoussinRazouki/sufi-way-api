import * as Yup from "yup";


export type GeneralSettingsDto = {
    sheikhEmail?: string,
    supportEmail?: string,
}

export type GeneralSettingsDtoPatch = GeneralSettingsDto;

// for getting details
export const GeneralSettingsDtoSchema = Yup.object().shape({
    sheikhEmail: Yup.string().optional(),
    supportEmail: Yup.string().optional(),
}); 

// for updating general settings
export const GeneralSettingsDtoPatchPayload = Yup.object().shape({
    sheikhEmail: Yup.string().email().optional(),
    supportEmail: Yup.string().email().optional(),
});

export type AskSheikhPayloadType = {
    email: string,
    subject: string,
    question: string,
}

export type AskSupportPayloadType = {
    email: string,
    subject: string,
    question: string,
}

export const AskSheikhPayload = Yup.object().shape({
    email: Yup.string().email("البريد الإلكتروني غير صالح").required('البريد الإلكتروني مطلوب'),
    subject: Yup.string().required('الموضوع مطلوب'),
    question: Yup.string().required('السؤال مطلوب'),
});
export const AskSupportPayload = Yup.object().shape({
    email: Yup.string().email("البريد الإلكتروني غير صالح").required('البريد الإلكتروني مطلوب'),
    subject: Yup.string().required('الموضوع مطلوب'),
    question: Yup.string().required('السؤال مطلوب'),
});