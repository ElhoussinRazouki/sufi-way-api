import { Request, Response } from "express";
import FQService from "../services/fq.service";



export const listController = async (req: Request, res: Response) => {
    const filters = req.query;
    FQService.list(filters).then((result) => {
        res.status(200).json(result);
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const detailsController = async (req: Request, res: Response) => {
    const id = req.params.id;
    FQService.details(id).then((result) => {
        result? res.status(200).json({ data: result }) : res.status(404).json({ message: "frequent question not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const createController = async (req: Request, res: Response) => {
    const payload = req.body;
    FQService.create(payload).then((created) => {
        res.status(200).json({ message: "frequent question created successfully.", data: created });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const updateController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    FQService.update(id, payload).then((updated) => {
        updated? res.status(200).json({ message: "frequent question updated successfully.", data: updated }) : res.status(404).json({ message: "frequent question not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const RemoveController = async (req: Request, res: Response) => {
    const id = req.params.id;
    FQService.remove(id).then((removed) => {
        removed? res.status(200).json({ message: "frequent question deleted successfully." }) : res.status(404).json({ message: "frequent question not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}
