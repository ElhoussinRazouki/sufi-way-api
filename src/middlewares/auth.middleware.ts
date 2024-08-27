import { NextFunction, Request, Response } from "express";
import { _checkToken, _isTokenExpired } from "../utils/jwt";


export type User = {
    id: string;
    userName: string;
    email: string;
    plan: string;
    avatar: string;
    iat: number;
    exp: number;

}


export const authMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'token is required.' });
    }
    const decodedToken = await _checkToken(token);
    if (!decodedToken) {
        return res.status(401).json({ message: 'token is invalid or expired.' });
    }
    req.user = decodedToken;
    next();
}
