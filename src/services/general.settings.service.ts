import { GeneralSettings } from "../models/general.settings.shema";
import { GeneralSettingsDtoPatch, GeneralSettingsDtoPatchPayload } from "../types/general.settings.types";
import { logs } from "../utils";


async function details() {
    try {
        const details = await GeneralSettings.findOne().lean();
        if (!details) {
            const newGeneralSettings = await GeneralSettings.create({});
            return newGeneralSettings.toJSON();
        }
        return details;
    } catch (error) {
        logs.error("Error: general settings, get details : ", error);
        throw new Error('خطأ أثناء جلب الإعدادات العامة');
    }
}

async function update(payload: GeneralSettingsDtoPatch) {
    await GeneralSettingsDtoPatchPayload.validate(payload);

    // check if there is any update
    if (Object.keys(payload).length === 0) {
        throw new Error('تغيير واحد على الأقل مطلوب لتطبيق التحديث.');
    }
    try {
        await GeneralSettings.updateOne({}, { ...payload, updated_at: new Date() }, { new: true });
        return await GeneralSettings.findOne().lean();
    } catch (error) {
        logs.error("Error: general settings, update : ", payload, error);
        throw new Error('خطأ أثناء تحديث الإعدادات العامة');
    }
}

const GeneralSettingsService = {
    details,
    update,
}

export default GeneralSettingsService;
