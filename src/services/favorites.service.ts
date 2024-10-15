import { Author, MultiMedia } from "../models/multimedia.schema";
import { News } from "../models/news.schema";
import { Users } from "../models/user.schema";
import { FavoriteDtoPayload, FavoriteDtoCreatePayload } from "../types/favorite.types";
import { logs } from "../utils";

export async function getUserFavorites(userId: string) {
    if (!userId) throw new Error('معرّف المستخدم مطلوب');

    try {
        const user = await Users.findOne({ _id: userId }).select('favorites').lean();
        if (!user) return null;
        // populate favorites
        const populatedFavorites = await Promise.all((user.favorites || []).map(async (favorite) => {
            if (favorite.type === 'news') {
                const newsItem = await News.findById(favorite.refId).lean();
                return { _id: favorite._id, created_at: favorite.created_at, type: 'news', data: newsItem };
            } else if (favorite.type === 'multimedia') {
                const multimediaItem = await MultiMedia.findById(favorite.refId).populate({
                    path: 'author_id',
                    model: Author,
                    select: '_id name avatar bio',
                }).lean();
                return { _id: favorite._id, created_at: favorite.created_at , type: 'multimedia', data: multimediaItem };
            }
        }));
        return populatedFavorites;
    } catch (error) {
        logs.error("Error: User, getFavorites : ", userId, error);
        throw new Error('خطأ أثناء جلب المفضلات');
    }
}

export async function createUserFavorite(userId: string, payload: FavoriteDtoPayload) {
    await FavoriteDtoCreatePayload.validate({ ...payload, userId });

    // check if actually the news or multimedia refId exists before pushing it 
    if (payload.type === 'news') {
        const newsItem = await News.findById(payload.refId).select("").lean();
        if (!newsItem) throw new Error('الخبر المفضل غير موجود');
    }
    if (payload.type === 'multimedia') {
        const multimediaItem = await MultiMedia.findById(payload.refId).select("").lean();
        if (!multimediaItem) throw new Error('الوسائط المتعددة المفضلة غير موجودة');
    }

    try {
        const result = await Users.updateOne({ _id: userId }, { $push: { favorites: payload } });
        if (result.modifiedCount) {
            return payload;
        }
        return null;
    } catch (error) {
        logs.error("Error: User, add favorite : ", userId, payload, error);
        throw new Error('خطأ أثناء إضافة المفضلة');
    }
}

export async function deleteUserFavorite(userId: string, favoriteId: string) {
    if (!userId || !favoriteId) throw new Error('معرّف المستخدم ومعرّف المفضلة مطلوبان');

    try {
        const result = await Users.updateOne({ _id: userId }, { $pull: { favorites: { _id: favoriteId } } });
        if (result.modifiedCount) {
            return favoriteId;
        }
        return null;
    } catch (error) {
        logs.error("Error: User, deleteFavorite : ", userId, favoriteId, error);
        throw new Error('خطأ أثناء حذف المفضلة');
    }
}
