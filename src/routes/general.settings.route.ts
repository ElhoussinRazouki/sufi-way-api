import { Router } from "express";
import { detailsController, updateController } from "../controllers/general.settings.controller";

export const GeneralSettingsRouter = Router();


// authors routes
GeneralSettingsRouter.get('/', detailsController);
GeneralSettingsRouter.patch('/', updateController);

