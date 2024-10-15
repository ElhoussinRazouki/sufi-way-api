import { Router } from "express";
import { createUserFavoriteController, deleteUserFavoriteController, getUserFavoritesController } from "../controllers/favorite.controller";

export const favoritesRouter = Router();


// profile routes

favoritesRouter.get('/', getUserFavoritesController);
favoritesRouter.post('/', createUserFavoriteController);
favoritesRouter.delete('/:id', deleteUserFavoriteController);


