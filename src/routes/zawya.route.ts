import { Router } from "express";
import { createController, detailsController, listController, RemoveController, updateController } from "../controllers/zawya.controller";
import { authMiddleWareAdmin } from "../middlewares/auth.middleware";

export const zawyaRouter = Router();



zawyaRouter.post('/', authMiddleWareAdmin, createController);
zawyaRouter.get('/', listController );
zawyaRouter.get('/:id', authMiddleWareAdmin, detailsController);
zawyaRouter.patch('/:id', authMiddleWareAdmin, updateController);
zawyaRouter.delete('/:id', authMiddleWareAdmin, RemoveController);

