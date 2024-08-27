import { Router } from "express";
import { changePasswordController, getProfileController, changeNameController } from "../controllers/user.controller";

export const userRouter = Router();


// profile routes
userRouter.get('/profile', getProfileController);
userRouter.patch('/change-password', changePasswordController);
userRouter.patch('/change-name', changeNameController);
