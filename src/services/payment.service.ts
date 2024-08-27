import Stripe from 'stripe';
import { environment } from '../utils/loadEnvironment';
import { Users } from '../models/user.schema';
import { Plans } from '../models/plan.schema';
import { getProfile } from './user.service';
import { unix } from 'moment';
import { Subscriptions } from '../models/subscription.schema';
import { Invoices } from '../models/invoice.schema';

export const stripe = new Stripe(environment.STRIPE_SECRET_KEY);

export const PAYMENT_METHODS = { card: "card", paypal: "paypal" }


export const createSubscription = async (planId: string, _id: string) => {
    const customerId = await getCustomerId(_id);
    const customerSubscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active' });
    if (customerSubscriptions.data.length > 0) {
        throw new Error("user already has an active subscription");
    }
    const plan = await Plans.findOne({ _id: planId }).lean();
    if (!plan) {
        throw new Error("Plan not found");
    }
    try {
        const priceId = plan.stripeProductMonthlyPriceId;
        console.log("customer id", customerId);
        const subscription: any = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: "default_incomplete",
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: { plan: plan.prefix, userId: _id } // used later for with validating payment intent webhook
        });

        return {
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret
        };
    } catch (error) {
        console.log("error creating subscription", error);
        throw new Error("something went wrong on creating subscription");
    }
};

// export const createCheckoutSession = async (planId: string, userId: string) => {
//     // const user = await Users.findOne({ _id }).select('_id email stripeCustomerId subscriptionId').lean();
//     const customerId = await getCustomerId(userId);
//     const customerSubscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active' });
//     if (customerSubscriptions.data.length > 0) {
//         throw new Error("user already has an active subscription");
//     }
//     const plan = await Plans.findById(planId).lean();
//     if (!plan) {
//         throw new Error("Plan not found");
//     }
//     try {
//         const priceId = plan.stripeProductMonthlyPriceId;
//         const checkoutSession = await stripe.checkout.sessions.create({
//             mode: "subscription",
//             customer: customerId,
//             line_items: [{
//                 price: priceId,
//                 quantity: 1
//             }],
//             metadata: { userId, plan: plan.prefix },
//             success_url: `${environment.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${environment.CLIENT_URL}/payment/cancel`,
//         });
//         return checkoutSession.url;
//     } catch (error) {
//         console.log("error creating subscription", error);
//         throw new Error("Failed to create subscription");
//     }
// };

export const createPortalSession = async (_id: string) => {
    const customerId = await getCustomerId(_id);
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${environment.CLIENT_URL}/account`
    })
    return portalSession.url;
};

export const getNextBillingCycleDate = async (_id: string) => {

    if(!_id) throw new Error("user id is required");
    const subscription = await Subscriptions.findOne({ userId: _id, status: "active" }).select("endDate schedulerId schedulerEndsAt").sort({ updated_at: 'desc' }).lean();
    if(!subscription) throw new Error("user has no active subscription");
    if(subscription.schedulerId && subscription.schedulerEndsAt && subscription.schedulerEndsAt > new Date()){
        throw new Error("Subscription already scheduled for downgrade");
    }

    return subscription?.endDate;
};

export const validateSubscription = async (_id: string, paymentIntentId: string, customer?: string) => {

    let paymentIntent: Stripe.Response<Stripe.PaymentIntent>;

    // check if the payment has already been validated because it may be validated for a user request and also by the webhook
    try {
        const isPaymentAlreadyValidated = await Invoices.findOne({ paymentIntentId }).lean();
        if (isPaymentAlreadyValidated) {
            return {
                message: "Payment already validated",
                data: { profile: await getProfile(_id) }
            };
        }
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['invoice'] });
    } catch (error) {
        console.error("Error retrieving payment intent:", error);
        throw new Error("Failed to validate payment. Please try again later.");
    }

    if (!customer) {
        const customerId = await getCustomerId(_id);
        if (paymentIntent?.customer !== customerId) {
            throw new Error("Invalid payment intent");
        }
    }

    // check if the payment intent is successful
    if (paymentIntent?.status != "succeeded") {
        throw new Error("Payment intent not successful");
    }

    let paymentInvoice: Stripe.Invoice | undefined;
    try {
        paymentInvoice = paymentIntent.invoice as Stripe.Invoice;
    } catch (error) {
        console.error("Error retrieving invoice:", error);
        throw new Error("Failed to validate payment. Please try again later.");
    }

    // check if the invoice is paid
    if (paymentInvoice?.status != "paid") {
        throw new Error("Invoice not paid");
    }

    const subscriptionId = paymentInvoice?.subscription;
    const planPrefix = paymentInvoice?.subscription_details?.metadata?.plan || "free";
    try {
        await Users.updateOne({ _id }, { $set: { plan: planPrefix, updated_at: new Date() } });
        await Subscriptions.updateOne({ _id: subscriptionId }, { $set: { plan: planPrefix, status: "active", startDate: new Date(paymentInvoice.period_start), endDate: new Date(paymentInvoice.period_end), updated_at: new Date() } });
    } catch (error) {
        console.error("Error updating user subscription:", error);
        throw new Error("Failed to validate payment. Please try again later.");
    }
    return { message: "payment validated successfully", data: await getProfile(_id) };
};

export const updateSubscription = async (_id: string, planId: string) => {
    const dbSubscription = await Subscriptions.findOne({ userId: _id, status: "active" }).sort({ updated_at: 'desc' }).lean();
    const plans = await Plans.find().sort({ monthlyPrice: 1 }).lean();

    const targetPlan = plans.find((plan) => plan._id.toString() === planId);
    if (!targetPlan) {
        throw new Error("invalid plan id");
    }
    if (!dbSubscription) {
        throw new Error("user has no active subscription");
    }
    if(dbSubscription.schedulerId && dbSubscription.schedulerEndsAt && dbSubscription.schedulerEndsAt > new Date()){
        throw new Error("Subscription already scheduled for downgrade");
    }
    let currentPlanIndex = 0;
    let targetPlanIndex = 0;
    plans.map((plan, index) => { if (plan._id.toString() === planId) targetPlanIndex = index; if (plan.prefix == dbSubscription?.plan) currentPlanIndex = index });

    if (currentPlanIndex === targetPlanIndex) {
        throw new Error("updating to the same plan is not possible");
    }
    if (targetPlanIndex > currentPlanIndex) {

        // check if the user has a scheduled downgrade
        if (dbSubscription.schedulerId) {
            const schedule = await stripe.subscriptionSchedules.retrieve(dbSubscription.schedulerId);
            if (schedule.status === 'active') {
                throw new Error("Subscription already scheduled for downgrade")
            }
        }

        // upgrade plan
        try {
            const subscription = await stripe.subscriptions.retrieve(dbSubscription._id as string);
            const updatedSubscription = await stripe.subscriptions.update(
                dbSubscription._id as string, {
                proration_behavior: "always_invoice",
                items: [{
                    id: subscription.items.data[0].id,
                    price: targetPlan.stripeProductMonthlyPriceId,
                }],
            });
            if (updatedSubscription.status === 'active') {
                console.log("subscription updated successfully")
                await Users.updateOne({ _id }, { $set: { plan: targetPlan.prefix, updated_at: new Date() } });
                return { message: "updated successfully", data: { profile: await getProfile(_id) } };
            }
            // console.log("subscription not updated successfully", updatedSubscription);
            if(updatedSubscription.status === "past_due"){
                const link = await createPortalSession(_id);
                return { message: "subscription past due", data: { link } }
            }
            throw new Error("something went wrong updating subscription");

        } catch (error) {
            console.error("Error upgrading subscription:", error);
            throw new Error("Failed to update subscription");
        }
    }
    if (targetPlanIndex < currentPlanIndex) {
        // downgrade plan
        try {
            const existingSubscription = await stripe.subscriptions.retrieve(dbSubscription._id as string);

            // check if the subscription is already scheduled for downgrade
            if (existingSubscription.cancel_at_period_end === true) {
                throw new Error("Subscription already scheduled for downgrade")
            }

            // calculate the start of the next billing cycle
            const currentPeriodEnd = existingSubscription.current_period_end;
            const currentPeriodStart = existingSubscription.current_period_start;
            const existingPlanPriceId = existingSubscription.items.data[0].price.id;


            // change the plan in the next billing cycle of the existing subscription
            const scheduler = await stripe.subscriptionSchedules.create({
                from_subscription: dbSubscription._id as string,
            });
            // const scheduler: any = await stripe.subscriptionSchedules.retrieve("sub_sched_1PCHZsL2UiFmuKSGAdSRacko");
            // console.log("scheduler", scheduler);

            // update the scheduler for changing the plan of the subscription at the end of the current billing cycle
            try {
                await stripe.subscriptionSchedules.update(scheduler.id, {
                    end_behavior: "release",
                    phases: [
                        {
                            start_date: currentPeriodStart,
                            end_date: currentPeriodEnd,
                            items: [{
                                price: existingPlanPriceId
                            }]
                        },
                        {
                            start_date: currentPeriodEnd,
                            items: [{
                                price: targetPlan.stripeProductMonthlyPriceId
                            }]
                        }
                    ]
                });
            } catch (error) {
                console.error( "Error while updating subscription :",error);
                throw new Error("Failed to update subscription schedule");
            }
            // return { message: "Downgrade scheduled!", data: { profile: await getProfile(_id) } }

            // schedule the existing subscription for cancelation at the end of the current billing cycle 
            // await stripe.subscriptions.update(dbSubscription._id as string, {
            //     cancel_at_period_end: true
            // });

            // save the schedule id to the user
            await Subscriptions.updateOne({ _id: dbSubscription._id as string }, { $set: { schedulerId: scheduler.id, schedulerEndsAt: unix(currentPeriodEnd) } });

            // message: updatedSubscription
            return { message: "Downgrade scheduled!", data: { profile: await getProfile(_id) } }
        } catch (error) {
            console.error("Error downgrading subscription:", error);
            throw new Error("something went wrong ");
        }
    }
};

export const prorateSubscription = async (_id: string, planId: string) => {

    const subscriptionId = await Subscriptions.findOne({ userId: _id, status: "active" }).select("_id schedulerId schedulerEndsAt").sort({ updated_at: "desc" }).lean();
    if (!subscriptionId) {
        throw new Error("user has no active subscription");
    }
    if(subscriptionId.schedulerId && subscriptionId.schedulerEndsAt && subscriptionId.schedulerEndsAt > new Date()){
        throw new Error("Subscription already scheduled for downgrade");
    }
    const plan = await Plans.findOne({ _id: planId }).select("stripeProductMonthlyPriceId monthlyPrice name prefix").lean();
    if (!plan) {
        throw new Error("Plan not found");
    }
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId?._id as string);

    if(!plan || !currentSubscription) throw new Error("something went wrong");

    // Set proration date to this moment:
    const proration_date = Math.floor(Date.now() / 1000);


    // See what the next invoice would look like with a price switch
    // and proration set:
    const items = [{
        id: currentSubscription.items.data[0].id,
        price: plan.stripeProductMonthlyPriceId, // Switch to new price
    }];

    const invoice = await stripe.invoices.retrieveUpcoming({
        subscription: currentSubscription.id,
        subscription_items: items,
        subscription_proration_date: proration_date
    });

    return { invoice }
    
};

export const webHookHandler = async (event: Stripe.Event) => {
    console.log("new event of type", event.type);
    switch (event.type) {
        case 'invoice.paid':
            await handleInvoicePaid(event.data.object as Stripe.Invoice);
            const subscription = await stripe.subscriptions.retrieve(event.data.object.subscription as string);
            await handleSubscriptionUpdated(subscription);
            break;
        case 'customer.subscription.created':
            await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
            break;
        case 'customer.deleted':
            await handleCustomerDeleted(event.data.object as Stripe.Customer)
            break;
    }
};

export const getPaymentMethods = async (userId: string) => {

    const customerId = await getCustomerId(userId);
    const paymentMethods = await stripe.paymentMethods.list({ customer: customerId })

    // get the default payment method id from the customer invoice settings
    const customerDetails: any = await stripe.customers.retrieve(customerId as string);
    const defaultPaymentMethod = customerDetails?.invoice_settings?.default_payment_method;

    return paymentMethods.data.map((paymentMethod)=>{
        if(paymentMethod.type === PAYMENT_METHODS.card){
            return {
                id: paymentMethod.id,
                card: paymentMethod.card,
                created_at: paymentMethod.created,
                isPrimary: defaultPaymentMethod === paymentMethod.id? true: false,
                type: paymentMethod.type
            }
        }
        if(paymentMethod.type === PAYMENT_METHODS.paypal){
            return {
                id: paymentMethod.id,
                paypal: {
                    payer_email: (paymentMethod.paypal?.payer_email as string).slice(0,5)
                },
                isPrimary: defaultPaymentMethod === paymentMethod.id? true: false,
                created_at: paymentMethod.created,
                type: paymentMethod.type
            }
        }
    });
    
};

export const setDefaultPaymentMethod = async (userId: string, paymentMethodId: string)=>{
    const customerId = await getCustomerId(userId);

    if(!paymentMethodId){
        throw Error("missing fields!")
    }

    const customerUpdates = {
        "invoice_settings": {
            "default_payment_method": paymentMethodId 
        }    
    }
    const result = await stripe.customers.update(customerId, customerUpdates);

    return await getPaymentMethods(userId)
};

export const deletePaymentMethod = async (userId: string, paymentMethodId: string)=>{
    if(!paymentMethodId || !userId){
        throw new Error("missing fields!");
    }
    try {
        const deletedPaymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
        console.log('Payment method detached:', deletedPaymentMethod);
        return await getPaymentMethods(userId);
    } catch (error) {
        console.error('Error detaching payment method:', error);
    }    
};

export const setupNewPaymentMethod = async (userId: string)=>{
    const customerId = await getCustomerId(userId);

    try {
        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ["card", "paypal"]
        })

        return { clientSecret: setupIntent.client_secret }
    } catch (error) {
        console.error("error: on setup new payment method", error);
        throw error;        
    }
};

const getCustomerId = async (_id: string) => {
    const user = await Users.findOne({ _id }).select('stripeCustomerId email').lean();
    if (user?.stripeCustomerId) {
        return user.stripeCustomerId;
    }
    const newCustomer = await stripe.customers.create({
        email: user?.email as string
    })
    await Users.updateOne({ _id }, { $set: { stripeCustomerId: newCustomer.id, updated_at: new Date() } });
    return newCustomer.id;
};

// const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
//     const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
//     if (session?.metadata) {
//         await Users.updateOne({ _id: session.metadata["userId"] }, { $set: { stripeSubscriptionId: subscription.id, plan: session.metadata["plan"], stripeSubscriptionStatus: subscription.status, stripeCheckoutSessionId: session.id, updated_at: new Date() } });
//     }
// };

const handleSubscriptionUpdated = async (subscription: Stripe.Subscription | any) => {
    const plan = await Plans.findOne({ stripeProductId: subscription.plan.product }).select("stripeProductId prefix").lean();
    await Users.updateOne({ stripeCustomerId: subscription.customer }, { $set: { plan: subscription.status === "active" ? plan?.prefix : "free", updated_at: new Date() } });
    const subscriptionDb = await Subscriptions.findOne({ _id: subscription.id }).lean();
    if (!subscriptionDb) {
        await Subscriptions.create({ _id: subscription.id, status: subscription.status, plan: subscription.status === "active" ? plan?.prefix : "free", startDate: unix(subscription.current_period_start), endDate: unix(subscription.current_period_end) });
        return;
    }
    await Subscriptions.updateOne({ _id: subscription.id }, { $set: { status: subscription.status, plan: subscription.status === "active" ? plan?.prefix : "free", startDate: unix(subscription.current_period_start), endDate: unix(subscription.current_period_end) } });
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
    await Users.updateOne({ stripeCustomerId: subscription.customer }, { $set: { plan: "free", updated_at: new Date() } });
    await Subscriptions.updateOne({ _id: subscription.id }, { $set: { status: subscription.status, plan: "free" } });
};

const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
    try {
        await Invoices.create({ invoiceId: invoice.id, paymentIntentId: invoice.payment_intent, subscriptionId: invoice.subscription, amount: invoice.amount_paid, periodStart: unix(invoice.period_start), periodEnd: unix(invoice.period_end), lines: invoice.lines.data, status: invoice.status });
    } catch (error) {
        console.error("Error saving invoice details:", error);
    }

};

const handleCustomerDeleted = async (customer: Stripe.Customer) => {
    await Users.updateOne({ stripeCustomerId: customer.id }, { $set: { stripeCustomerId: null, plan: "free", updated_at: new Date() } });
    await Subscriptions.updateMany({ customerId: customer.id }, { $set: { status: "canceled" } });
};

const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
    console.log("try create subscription", subscription);
    try {
        let userId = subscription.metadata["userId"];
        let plan = subscription.metadata["plan"];
        if (!userId && !plan) {
            const user = await Users.findOne({ stripeCustomerId: subscription.customer }).select("_id").lean();
            if (user) {
                userId = user._id.toString();
            }
            const dbPlan = await Plans.findOne({ stripeProductId: subscription.items.data[0].price.product }).select("prefix").lean();
            if (dbPlan) {
                plan = dbPlan.prefix;
            }

            // because the subscription doesn't provide a way to add metadata to the future subscription , add metadata to the subscription for future updates happening in the webhook
            stripe.subscriptions.update(subscription.id, {
                metadata: { userId, plan }
            })
        }
        const createdSubscription = await Subscriptions.create({ _id: subscription.id, userId, customerId: subscription.customer, status: subscription.status });
        console.log("created subscription", createdSubscription);
    } catch (error) {
        console.error("Error saving subscription details:", error);
    }
};



type PaymentAction = "subscribe" | "update" | "cancel" | "resume" | "retry" | "refund" | "delete";