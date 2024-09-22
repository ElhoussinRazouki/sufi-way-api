import { Router } from "express";
import { createController, detailsController, listController, RemoveController, updateController } from "../controllers/authors.controller";

export const authorsRouter = Router();


// authors routes
authorsRouter.post('/', createController);
authorsRouter.get('/', listController );
authorsRouter.get('/:id', detailsController);
authorsRouter.patch('/:id', updateController);
authorsRouter.delete('/:id', RemoveController);

