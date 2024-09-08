import { Request, Response } from "express";
import { createMultiMedia, deleteMultiMedia, getMultiMediaById, getMultiMediaList, updateMultiMedia } from "../services/multimedia.service";




export const getMultiMediaListController = async (req: Request, res: Response) => {
    const filters = req.query;
    getMultiMediaList({ type: "video", ...filters }).then((list) => {
        res.status(200).json({ data: list });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const getMultiMediaByIdController = async (req: Request, res: Response) => {
    const multimediaId = req.params.id;
    getMultiMediaById(multimediaId).then((multimedia) => {
        multimedia? res.status(200).json({ data: multimedia }) : res.status(404).json({ message: "multimedia not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const createMultiMediaController = async (req: Request, res: Response) => {
    const multimediaPayload = req.body;
    createMultiMedia(multimediaPayload).then((newMultiMedia) => {
        res.status(200).json({ message: "multimedia created successfully.", data: newMultiMedia });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const updateMultiMediaController = async (req: Request, res: Response) => {
    const multimediaId = req.params.id;
    const multimediaPayload = req.body;
    updateMultiMedia(multimediaId, multimediaPayload).then((updatedMultiMedia) => {
        updatedMultiMedia? res.status(200).json({ message: "multimedia updated successfully." }) : res.status(404).json({ message: "multimedia not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const deleteMultiMediaController = async (req: Request, res: Response) => {
    const multimediaId = req.params.id;
    deleteMultiMedia(multimediaId).then((deletedMultiMedia) => {
        deletedMultiMedia? res.status(200).json({ message: "multimedia deleted successfully." }) : res.status(404).json({ message: "multimedia not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}
