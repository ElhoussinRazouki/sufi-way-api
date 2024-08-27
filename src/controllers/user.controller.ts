import { Request, Response } from "express";
import { changePassword, getProfile, changeName } from "../services/user.service";



// profile controllers

export const getProfileController = async (req: Request, res: Response) => {
    const user: any = req.user;
    getProfile(user.id).then((profile) => {
        res.status(200).json({ data: profile });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    })
}

export const changePasswordController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user.id;
    const { oldPassword, newPassword } = req.body;
    const otp = req.body.otp;
    if(!otp) return res.status(400).json({ message: "missing otp field" });
    if(!oldPassword || !newPassword) return res.status(400).json({ message: "both oldPassword and newPassword are required." });
    changePassword(userId, oldPassword, newPassword, otp).then(() => {
        res.status(200).json({ message: "password changed successfully" });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    })
}

export const changeNameController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user.id;
    const { firstName, lastName } = req.body;
    changeName(userId, firstName, lastName).then(() => {
        res.status(200).json({ message: "name changed successfully" });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    })
}
