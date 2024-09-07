import { Router } from "express";
import { createUserNoteController, deleteUserNoteController, getUserNotesController, updateUserNoteController } from "../controllers/note.controller";

export const notesRouter = Router();


// profile routes

notesRouter.get('/', getUserNotesController);
notesRouter.post('/', createUserNoteController);
notesRouter.patch('/:id', updateUserNoteController);
notesRouter.delete('/:id', deleteUserNoteController);


