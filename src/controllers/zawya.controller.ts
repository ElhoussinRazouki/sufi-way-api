import { Request, Response } from "express";
import ZawyaService from "../services/zawya.service";



export const listController = async (req: Request, res: Response) => {
    const filters = req.query;
    ZawyaService.list(filters).then((result) => {
        res.status(200).json(result);
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const detailsController = async (req: Request, res: Response) => {
    const id = req.params.id;
    ZawyaService.details(id).then((result) => {
        result? res.status(200).json({ data: result }) : res.status(404).json({ message: "author not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const createController = async (req: Request, res: Response) => {
    const payload = req.body;
    ZawyaService.create(payload).then((created) => {
        res.status(200).json({ message: "author created successfully.", data: created });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const updateController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    ZawyaService.update(id, payload).then((updated) => {
        updated? res.status(200).json({ message: "author updated successfully.", data: updated }) : res.status(404).json({ message: "author not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const RemoveController = async (req: Request, res: Response) => {
    const id = req.params.id;
    ZawyaService.remove(id).then((removed) => {
        removed? res.status(200).json({ message: "author deleted successfully." }) : res.status(404).json({ message: "author not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}
