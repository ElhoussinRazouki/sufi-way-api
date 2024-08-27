import { Router } from "express";
import {  handleAuthFailController, handleAuthSuccessController, loginController, logoutController, refreshTokenController, registerController, resetPasswordController, verifyUserController } from "../controllers/auth.controller";
import passport from "../services/auth20.service";

export const authRouter = Router();

authRouter.post('/login', loginController);

authRouter.post('/register', registerController);

authRouter.post('/email-verification', verifyUserController);

authRouter.post('/refresh', refreshTokenController);

authRouter.post('/logout', logoutController);

authRouter.post('/reset-password', resetPasswordController);



// auth 2.0
// google
authRouter.get("/google", passport.authenticate("google"))
authRouter.get("/google/callback", passport.authenticate("google", {
    session: false,
}), handleAuthFailController, handleAuthSuccessController)
