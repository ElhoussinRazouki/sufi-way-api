import { Request, Response } from "express";
import SheikhService from "../services/sheikh.service";



export const listController = async (req: Request, res: Response) => {
    const filters = req.query;
    SheikhService.list(filters).then((result) => {
        res.status(200).json(result);
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const detailsController = async (req: Request, res: Response) => {
    const id = req.params.id;
    SheikhService.details(id).then((result) => {
        result? res.status(200).json({ data: result }) : res.status(404).json({ message: "sheikh information not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const createController = async (req: Request, res: Response) => {
    const payload = req.body;
    SheikhService.create(payload).then((created) => {
        res.status(200).json({ message: "Sheikh Information added successfully.", data: created });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const updateController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    SheikhService.update(id, payload).then((updated) => {
        updated? res.status(200).json({ message: "sheikh information updated successfully.", data: updated }) : res.status(404).json({ message: "sheikh information not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const RemoveController = async (req: Request, res: Response) => {
    const id = req.params.id;
    SheikhService.remove(id).then((removed) => {
        removed? res.status(200).json({ message: "sheikh information removed successfully." }) : res.status(404).json({ message: "sheikh information not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}
