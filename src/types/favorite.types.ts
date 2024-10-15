import * as Yup from "yup";
import { FAVORITES_TYPES } from "../constants";

type FavoriteType = typeof FAVORITES_TYPES[number];

export const FavoriteDtoCreatePayload = Yup.object().shape({
    userId: Yup.string().required(),
    type: Yup.string().oneOf(FAVORITES_TYPES).required(),
    refId: Yup.string().required()
});

export type FavoriteDtoPayload = {
    userId: string,
    type: FavoriteType,
    refId: string
}