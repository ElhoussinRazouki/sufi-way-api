import { Router } from "express";
import { askSheikhController } from "../controllers/common.controller";

export const commonRouter = Router();


// authors routes
commonRouter.post('/ask-sheikh', askSheikhController);

