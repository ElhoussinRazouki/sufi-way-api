import { Request, Response } from "express";
import { createUserFavorite, getUserFavorites, deleteUserFavorite } from "../services/favorites.service";


export const getUserFavoritesController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user?.id as string;
    getUserFavorites(userId).then((favorites) => {
        favorites? res.status(200).json({ data: favorites }) : res.status(404).json({ message: "favorites not found for the specific user provided." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    }); 
}

export const createUserFavoriteController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user?.id as string;

    const Payload = req.body;
    createUserFavorite(userId, Payload).then((newFavorite) => {
        newFavorite? res.status(200).json({ message: "favorite added successfully." }) : res.status(404).json({ message: "user not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

export const deleteUserFavoriteController = async (req: Request, res: Response) => {
    const user: any = req.user;
    const userId = user?.id as string;

    const favoriteId = req.params.id;
    deleteUserFavorite(userId, favoriteId).then((deletedFavoriteId) => {
        deletedFavoriteId? res.status(200).json({ message: "favorite deleted successfully." }) : res.status(404).json({ message: "favorite not found." });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    });
}

