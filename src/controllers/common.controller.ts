import { Request, Response } from "express";
import { User } from "../middlewares/auth.middleware";
import { commonService } from "../services/common.service";




// ask sheikh 
export const askSheikhController = async (req: Request, res: Response) => {

    const user = req.user as User;
    const payload = req.body;
    commonService.askSheikh(user.id, payload).then(() => {
        res.status(200).json({ message: "تم استلام سؤالك من قبل الشيخ. سوف تحصل على إجابة قريباً" });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    })
}