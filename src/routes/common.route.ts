import { Router } from "express";
import { askSheikhController, contactSupportController } from "../controllers/common.controller";

export const commonRouter = Router();


// authors routes
commonRouter.post('/ask-sheikh', askSheikhController);

// contact support 
commonRouter.post('/contact-support', contactSupportController);

