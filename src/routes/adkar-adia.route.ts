import { Router } from "express";
import { createController, detailsController, listController, RemoveController, updateController } from "../controllers/adkarAdia.controller";
import { authMiddleWareAdmin } from "../middlewares/auth.middleware";

export const adkarAdiaRouter = Router();


// adkar and adia routes
adkarAdiaRouter.post('/', authMiddleWareAdmin, createController);
adkarAdiaRouter.get('/', listController );
adkarAdiaRouter.get('/:id', detailsController);
adkarAdiaRouter.patch('/:id', authMiddleWareAdmin, updateController);
adkarAdiaRouter.delete('/:id', authMiddleWareAdmin, RemoveController);

