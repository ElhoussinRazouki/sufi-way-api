import { Request, Response } from "express";
import { getPlans } from "../services/plan.service";





export const getPlansController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user?.id;
    getPlans(userId).then((plans) => {
        res.status(200).send(plans);
    }).catch((err) => {
        console.log("error getting plans", err);
        res.status(500).json({ message: "failed to get plans" });
    });
}