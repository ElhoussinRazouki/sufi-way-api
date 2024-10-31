import { Router } from "express";
import { createController, detailsController, listController, RemoveController, updateController } from "../controllers/sheikhs.controller";
import { authMiddleWareAdmin } from "../middlewares/auth.middleware";

export const sheikhsRouter = Router();

// sheikhs routes
sheikhsRouter.post('/', authMiddleWareAdmin, createController);
sheikhsRouter.get('/', listController );
sheikhsRouter.get('/:id', authMiddleWareAdmin, detailsController);
sheikhsRouter.patch('/:id', authMiddleWareAdmin, updateController);
sheikhsRouter.delete('/:id', authMiddleWareAdmin, RemoveController);

