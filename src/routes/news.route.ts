import { Router } from "express";
import { createController, detailsController, listController, RemoveController, updateController } from "../controllers/news.controller";
import { authMiddleWareAdmin } from "../middlewares/auth.middleware";

export const newsRouter = Router();


// authors routes
newsRouter.post('/', authMiddleWareAdmin, createController);
newsRouter.get('/', listController );
newsRouter.get('/:id', detailsController);
newsRouter.patch('/:id', authMiddleWareAdmin, updateController);
newsRouter.delete('/:id', authMiddleWareAdmin, RemoveController);

