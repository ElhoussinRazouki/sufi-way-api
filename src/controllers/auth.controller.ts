import { NextFunction, Request, Response } from "express";
import { googleAuth, loginUser, logout, refreshToken, registerUser, resetPassword, verifyUserEmail } from "../services/auth.service";



export const registerController = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'missing fields' });
    }
    const ipAddress = req.headers['x-forwarded-for'] as string;
    registerUser(username, email, password, ipAddress).then((value) => {
        res.status(201).json({ message: "User registered successfully. A verification email has been sent." });
    }).catch((error) => {
        res.status(500).json({ message: error.message });
    })
}

export const loginController = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] as string;
    console.log("ip address : ",ipAddress);
    const userAgent = req.headers['user-agent'];
    if (!email || !password) {
        return res.status(400).json({ message: 'missing fields' });
    }
    loginUser(email, password, ipAddress, userAgent).then((newTokens: any) => {
        res.status(200).json(newTokens);
    }).catch((error) => {
        res.status(401).json({ message: error.message });
    })

}





export const verifyUserController = async (req: Request, res: Response) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ message: 'missing fields' });
    }
    await verifyUserEmail(email, code).then(() => {
        res.status(200).json({ message: 'email verified successfully' });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    })
}

export const refreshTokenController = (req: Request, res: Response) => {
    const refresh_token = req.body.refreshToken;
    if (!refresh_token) {
        return res.status(401).json({ message: 'refresh token is required.' });
    }
    const ipAddress = req.ip;
    refreshToken(refresh_token, ipAddress as string).then((newTokens: any) => {
        res.status(200).json(newTokens);
    }).catch((error: any) => {
        res.status(400).json({ message: error.message });
    })
}

export const logoutController = (req: Request, res: Response) => {
    const refresh_token = req.body.refreshToken;
    const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!accessToken || !refresh_token) {
        return res.status(401).json({ message: 'both tokens are required.' });
    }
    logout(accessToken, refresh_token).then(() => {
        res.status(200).json({ message: 'logout successfully' });
    }).catch((error: any) => {
        res.status(400).json({ message: error.message });
    })
}

export const resetPasswordController = (req: Request, res: Response) => {
    const { email, newPassword } = req.body;
    if(email  && newPassword){
        resetPassword(email, newPassword).then(() => {
            res.status(200).json({ message: 'password reset successfully' });
        }).catch((error: any) => {
            res.status(400).json({ message: error.message });
        })
        return;
    }
    res.status(400).json({ message: 'missing fields' });
}

export const handleAuthFailController = (err: Error, req: any, res: any, next: NextFunction) => { 
    if (err) {
        console.error(err.message)
        res.status(401).json({ message: "authentication failed" });
    }  
};

export const handleAuthSuccessController = (req: any, res: any) => {
    const ipAddress = req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];
    googleAuth(req.user, ipAddress, userAgent).then((tokens: any) => {
        res.status(200).json(tokens);
    }).catch((error: any) => {
        res.status(400).json({ message: error.message });
    })
};