import { Router } from "express";
import { authMiddleWareAdmin } from "../middlewares/auth.middleware";
import { createController, detailsController, listController, RemoveController, updateController } from "../controllers/authors.controller";

export const authorsRouter = Router();


// profile routes
authorsRouter.post('/', authMiddleWareAdmin, createController);
authorsRouter.get('/', authMiddleWareAdmin, listController );
authorsRouter.get('/:id', authMiddleWareAdmin, detailsController);
authorsRouter.patch('/:id', authMiddleWareAdmin, updateController);
authorsRouter.delete('/:id', authMiddleWareAdmin, RemoveController);

