import { Schema, model } from 'mongoose';

const GeneralSettingsSchema = new Schema({
    sheikhEmail : { type: String, default: null },
    supportEmail : { type: String, default: null },
});

export const GeneralSettings = model('GeneralSettings', GeneralSettingsSchema);
