import { Schema, model } from "mongoose";


const invoiceSchema = new Schema({
    invoiceId: { type: String, required: true },
    paymentIntentId: { type: String, required: true },
    subscriptionId: { type: String, required: true, ref: 'Subscription' },
    amount: { type: Number, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    lines: [{  
      description: String,
      amount: Number,
    }],
    status: { type: String, required: true }, 
    created_at: { type: Date, default: Date.now },
  });
  
invoiceSchema.index({ invoiceId: 1, subscriptionId: 1, amount: 1, currency: 1, periodStart: 1, periodEnd: 1, status: 1 });

export const Invoices = model('Invoices', invoiceSchema);