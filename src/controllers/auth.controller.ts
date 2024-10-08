import { NextFunction, Request, Response } from "express";
import { googleAuth, loginUser, logout, refreshToken, registerUser, requestResetPassword, resetPassword, verifyResetPasswordCode, verifyUserEmail } from "../services/auth.service";
import { logs } from "../utils";



export const registerController = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'missing fields' });
    }
    registerUser(username, email, password).then((value) => {
        res.status(201).json({ message: "User registered successfully. A verification email has been sent." });
    }).catch((error) => {
        res.status(500).json({ message: error.message });
    })
}

export const loginController = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'missing fields' });
    }
    loginUser(email, password).then((newTokens: any) => {
        res.status(200).json({ message: "user logged successfully", data: newTokens });
    }).catch((error) => {
        logs.error(error);
        res.status(401).json({ message: error.message });
    })

}

export const verifyUserController = async (req: Request, res: Response) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ message: 'missing fields' });
    }
    await verifyUserEmail(email, code).then((tokens) => {
        res.status(200).json({ message: 'email verified successfully', data: tokens });
    }).catch((error) => {
        res.status(400).json({ message: error.message });
    })
}

export const refreshTokenController = (req: Request, res: Response) => {
    const refresh_token = req.body.refreshToken;
    if (!refresh_token) {
        return res.status(401).json({ message: 'refresh token is required.' });
    }
    refreshToken(refresh_token).then((newTokens: any) => {
        res.status(200).json({ message: 'tokens refreshed successfully', data: newTokens });
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
    const { email, password, code } = req.body;
    if (email && password && code) {
        return resetPassword(email, code, password).then((newTokens) => {
            res.status(200).json({ message: 'password reset successfully', data: newTokens });
        }).catch((error: any) => {
            res.status(400).json({ message: error.message });
        })
    }
    if (email && !code && !password) {
        return requestResetPassword(email).then(() => {
            res.status(200).json({ message: 'reset password email sent' });
        }).catch((error: any) => {
            res.status(400).json({ message: error.message });
        })
    }
    if (email && code && !password) {
        return verifyResetPasswordCode(email, code).then(() => {
            res.status(200).json({ message: 'code verified successfully' });
        }).catch((error: any) => {
            res.status(400).json({ message: error.message });
        })
    }
    return res.status(400).json({ message: 'missing fields' });
}

export const handleAuthFailController = (err: Error, req: any, res: any, next: NextFunction) => {
    if (err) {
        logs.error(err.message)
        res.status(401).json({ message: "authentication failed" });
    }
};

export const handleAuthSuccessController = (req: any, res: any) => {
    const ipAddress = req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];
    googleAuth(req.user, ipAddress, userAgent).then(({ accessToken, refreshToken }: any) => {
        const deepLink = `sofi-tariqa://auth?success=true&accessToken=${accessToken}&refreshToken=${refreshToken}`;
        res.redirect(deepLink);

        // res.status(200).json({ message: "authentication success.", data: tokens });
    }).catch((error: any) => {
        // res.status(400).json({ message: error.message });
        const deepLink = `sofi-tariqa://auth?success=false&error=${error.message}`;
        res.redirect(deepLink);

    })
};