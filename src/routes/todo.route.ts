import { Router } from "express";
import { createController, listController, RemoveController, updateController } from "../controllers/todo.controller";

export const todoRouter = Router();


// todo routes
todoRouter.post('/', createController);
todoRouter.get('/', listController );
todoRouter.patch('/:id', updateController);
todoRouter.delete('/:id', RemoveController);

