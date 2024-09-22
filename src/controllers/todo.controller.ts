import { Request, Response } from "express";
import TodoService from "../services/todo.service";
import { User } from "../middlewares/auth.middleware";



export const listController = async (req: Request, res: Response) => {
    const filters = req.query;
    const user = req.user as User;

    TodoService.list(user.id, filters).then((result) => {
        res.status(200).json(result);
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const createController = async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user as User;
    TodoService.create(user.id, payload).then((created) => {
        res.status(200).json({ message: "todo created successfully.", data: created });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const updateController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    const user = req.user as User;

    TodoService.update(user.id, id, payload).then((updated) => {
        updated? res.status(200).json({ message: "todo updated successfully.", data: updated }) : res.status(404).json({ message: "todo not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const RemoveController = async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user as User;

    TodoService.remove(id, user.id).then((removed) => {
        removed? res.status(200).json({ message: "todo deleted successfully." }) : res.status(404).json({ message: "todo not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}
