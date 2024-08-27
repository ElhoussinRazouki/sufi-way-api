import { Schema, model } from "mongoose";

const planSchema = new Schema({
    name: { type: String, required: true },
    prefix: { type: String, required: true}, 
    description: { type: String },
    stripeProductId: { type: String, required: true, unique: true },
    stripeProductMonthlyPriceId: { type: String, required: true, unique: true },
    lookupKey: { type: String, required: true, unique: true },
    poster: { type: String },
    monthlyPrice: { type: Number, required: true },
    interval: { type: String, required: true, enum: ['month', 'year'], default: 'month'}, 
    intervalCount: { type: Number, required: true, min: 1 },
    trialDays: { type: Number, default: 0 }, 
    features: { type: [String] },
});



planSchema.index({ name: 1, stripeProductId: 1, stripeProductMonthlyPriceId: 1});

export const Plans = model('Plan', planSchema);