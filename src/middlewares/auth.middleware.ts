import { NextFunction, Request, Response } from "express";
import { _checkToken, _isTokenExpired } from "../utils/jwt";


export type User = {
    id: string;
    userName: string;
    email: string;
    plan: string;
    isAdmin: boolean;
    avatar: string;
    iat: number;
    exp: number;
}


export async function authMiddleWare (req: Request, res: Response, next: NextFunction) {
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


export async function authMiddleWareAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req.user as User;
    if (user && user.isAdmin) {
        // User is admin, proceed to the next middleware or route handler
        return next();
      }
    
      // If not, return an authorization error
      return res.status(403).json({
        error: 'Authorization error: Admin access is required',
      });
    
}