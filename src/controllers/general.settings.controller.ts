import { Request, Response } from "express";
import FQService from "../services/fq.service";
import GeneralSettingsService from "../services/general.settings.service";



export const detailsController = async (req: Request, res: Response) => {
    GeneralSettingsService.details().then((result) => {
        result? res.status(200).json({ data: result }) : res.status(404).json({ message: "general settings not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const updateController = async (req: Request, res: Response) => {
    const payload = req.body;
    GeneralSettingsService.update(payload).then((updated) => {
        updated? res.status(200).json({ message: "general settings updated successfully.", data: updated }) : res.status(404).json({ message: "general settings not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}