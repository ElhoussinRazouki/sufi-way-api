import { Schema, model } from "mongoose";



const subscriptionSchema = new Schema({
    _id: { type: String },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
    customerId: { type: String, required: true },
    email: String,
    plan: String,
    schedulerId: String,
    schedulerEndsAt: Date,
    status: { type: String},
    startDate: { type: Date},
    endDate: { type: Date, default: null},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});


subscriptionSchema.index({ userId: 1});
subscriptionSchema.index({ customerId: 1 });
subscriptionSchema.index({  email: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ startDate: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ nexBillingDate: 1 });


export const Subscriptions = model('Subscription', subscriptionSchema);