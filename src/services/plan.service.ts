import { Plans } from "../models/plan.schema"
import { Users } from "../models/user.schema"



export const getPlans = async (userId?: string) => {
    if (userId) {
        let user = await Users.findOne({ _id: userId }).select('plan').lean();
        let plans = await Plans.find().select('id name monthlyPrice prefix description poster features').lean()
        plans = plans.map(plan => ({
            ...plan,
            isCurrent: plan.prefix === user?.plan
        }))
        
        return { data: plans };
    }
    const plans = await Plans.find().select('id name monthlyPrice prefix description poster features').lean()
    return { data: plans || [] };
}