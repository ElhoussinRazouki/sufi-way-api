import { Router } from "express";
import { createController, detailsController, listController, RemoveController, updateController } from "../controllers/fq.controller";
import { authMiddleWareAdmin } from "../middlewares/auth.middleware";

export const FQRouter = Router();


// authors routes
FQRouter.post('/', authMiddleWareAdmin, createController);
FQRouter.get('/', listController );
FQRouter.get('/:id', authMiddleWareAdmin, detailsController);
FQRouter.patch('/:id', authMiddleWareAdmin, updateController);
FQRouter.delete('/:id', authMiddleWareAdmin, RemoveController);

