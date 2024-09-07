import { Router } from "express";
import { getMultiMediaListController, createMultiMediaController, updateMultiMediaController, getMultiMediaByIdController, deleteMultiMediaController } from "../controllers/multimedia.controller";
import { authMiddleWareAdmin } from "../middlewares/auth.middleware";

export const multimediaRouter = Router();


// profile routes
multimediaRouter.post('/', authMiddleWareAdmin, createMultiMediaController);
multimediaRouter.get('/', getMultiMediaListController );
multimediaRouter.get('/:id', getMultiMediaByIdController);
multimediaRouter.patch('/:id', authMiddleWareAdmin, updateMultiMediaController);
multimediaRouter.delete('/:id', authMiddleWareAdmin, deleteMultiMediaController);

