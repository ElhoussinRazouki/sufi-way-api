import { Request, Response } from "express";
import { createUserNote, deleteUserNote, getUserNotes, updateUserNote } from "../services/notes.service";


export const getUserNotesController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user?.id as string;
    getUserNotes(userId).then((notes) => {
        notes? res.status(200).json({ data: notes }) : res.status(404).json({ message: "notes not found for the specific user provided." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    }); 
}

export const createUserNoteController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user?.id as string;

    const notePayload = req.body;
    createUserNote(userId, notePayload).then((newNote) => {
        newNote? res.status(200).json({ message: "note created successfully." }) : res.status(404).json({ message: "user not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const deleteUserNoteController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user?.id as string;

    const noteId = req.params.id;
    deleteUserNote(userId, noteId).then((deletedNoteId) => {
        deletedNoteId? res.status(200).json({ message: "note deleted successfully." }) : res.status(404).json({ message: "note not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const updateUserNoteController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user?.id as string;
    
    const noteId = req.params.id;
    const notePayload = req.body;
    updateUserNote(userId, noteId, notePayload).then((updatedNote) => {
        updatedNote? res.status(200).json({ message: "note updated successfully." }) : res.status(404).json({ message: "note not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}