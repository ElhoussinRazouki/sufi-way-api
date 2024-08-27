import { model, Schema } from "mongoose";




const emailLogsSchema = new Schema({
    timestamp: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    snapshot: {
        type: {
            userName: String,
            firstName: String,
            lastName: String,
            plan: String,
            is2faActive: Boolean,
        }
    },
    oldEmail: String,
    newEmail: String
});


export const EmailLogs = model('EmailLogs', emailLogsSchema);