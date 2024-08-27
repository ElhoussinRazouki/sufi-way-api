import { Request, Response } from "express";
import { createPortalSession, createSubscription, deletePaymentMethod, getNextBillingCycleDate, getPaymentMethods, prorateSubscription, setDefaultPaymentMethod, setupNewPaymentMethod, stripe, updateSubscription, validateSubscription, webHookHandler } from "../services/payment.service";
import { environment } from "../utils/loadEnvironment";


const PAYMENT_METHODS_ACTIONS_ARRAY = ["make-default", "add-one"];
const PAYMENT_METHODS_ACTIONS = {
    makeDefault : "make-default",
    addOne: "add-one"
}


export const configController = (req: Request, res: Response) => {

    res.status(200).json({ message: "Payment config controller" });
}

export const createSubscriptionController = (req: Request, res: Response) => {
    const user: any = req.user;
    const planId = req.body.planId;

    if(!planId) {
        return res.status(400).json({ message: "missing fields planId is required" });
    }
    createSubscription(planId, user.id).then((invoiceDetails)=>{
        res.status(200).json({ data: invoiceDetails });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const prorateSubscriptionController = (req: Request, res: Response) => {
    const user: any = req.user;
    const planId = req.body.planId;

    if(!planId) {
        return res.status(400).json({ message: "missing fields planId is required" });
    }
    prorateSubscription(user.id, planId).then((invoiceDetails)=>{
        res.status(200).json({ data: invoiceDetails });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });

}

export const getNextBillingCycleDateController = (req: Request, res: Response) => {
    const user: any = req.user;
    getNextBillingCycleDate(user.id).then((nextBillingCycleDate)=>{
        res.status(200).json({ data: { nextBillingCycleDate } });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

// export const createCheckoutSessionController = (req: Request, res: Response) => {
//     const user: any = req.user;
//     const planId = req.body.planId;

//     if(!planId) {
//         return res.status(400).json({ message: "missing fields planId is required" });
//     }
//     createCheckoutSession(planId, user.id).then((redirect_url: any)=>{
//         res.json({ data: { link: redirect_url } });
//     }).catch((error) => {
//         res.status(500).json({ message: error.message });
//     });
// }

export const validateCheckoutSessionController = (req: Request, res: Response) => {
    const user: any = req.user;
    const paymentIntentId = req.body.paymentIntentId;

    if(!paymentIntentId) {
        return res.status(400).json({ message: "missing fields paymentIntentId is required" });
    }
    validateSubscription(user.id, paymentIntentId).then((paymentIntent)=>{
        res.status(200).json(paymentIntent);
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const createPortalSessionController = (req: Request, res: Response) => {
    const user: any = req.user;
    createPortalSession(user.id).then((portalSessionUrl)=>{
        res.status(200).json({ data: { link: portalSessionUrl    } });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
};

export const updateSubscriptionController = (req: Request, res: Response) => {
    const user: any = req.user;
    const planId = req.body.planId;
    if(!planId) {
        return res.status(400).json({ message: "missing fields planId is required" });
    }
    updateSubscription(user.id, planId).then((invoiceDetails)=>{
        res.status(200).json({ data: invoiceDetails });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });

};

export const webhookController = (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, environment.WEBHOOK_SECRET);
    } catch (err: any) {
        console.log(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    webHookHandler(event).then(()=>{
        res.send();
    }).catch((err: any)=>{
        res.status(500).send(err.message);
    })
};

export const getPaymentMethodsController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user.id;
    getPaymentMethods(userId).then((paymentMethods)=>{
        res.json({
            data: paymentMethods
        })
    }).catch((error)=>{
        console.error(error);
        res.status(400).json({
            message: "something went wrong!, try again"
        })
    })
};

export const updatePaymentMethodsController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user.id;
    const action = req.query?.action
    const paymentMethodId = req.body?.paymentMethodId;

    if(!action || !PAYMENT_METHODS_ACTIONS_ARRAY.includes(action as string)){
        return res.status(400).json({ message: "invalid action!" })
    }
    if(!paymentMethodId){
        return res.status(400).json({ message: "missing field! paymentMethodId required" })
    }

    if(action === PAYMENT_METHODS_ACTIONS.makeDefault){
        return setDefaultPaymentMethod(userId, paymentMethodId).then((paymentMethods: any[])=>{
            res.status(200).json({ data: paymentMethods })
        }).catch((err: Error)=>{
            res.status(400).json({ message: err.message })
        })
    }
};

export const deletePaymentMethodsController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user.id;
    const id = req.params.id;

    if(!id){
        return res.status(400).json({
            message: "missing field id of the payment method is required!"
        })
    }
    deletePaymentMethod(userId, id).then((paymentMethods:any)=>{
        res.status(200).json({ data: paymentMethods })
    }).catch((err: Error)=>{
        res.status(400).json({ message: err.message })
    })

};

export const setupNewPaymentMethodController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user.id;

    setupNewPaymentMethod(userId).then((payload)=>{
        res.status(200).json({
            data: payload
        })
    }).catch((err)=>{
        res.status(400).json({
            message: err.message || "something went wrong!"
        })
    })
};