import jwt from 'jsonwebtoken'
import { environment } from './loadEnvironment'

// @ts-nocheck - Disable type checking for this file

export const _generateToken = async (payload: any, lifeTime: string) => {
  return jwt.sign(payload, environment.JWT_SECRET, {
    expiresIn: lifeTime,
  })
}

export const _refreshToken = async (accessToken: string, lifeTime: string): Promise<string> => {
  try {
    const decodedToken = jwt.decode(accessToken);
    if (!decodedToken) {
      throw new Error('Invalid token');
    }

    // Remove expiration and issued at claims
    const payload = { ...(decodedToken as object) };
    delete (payload as any).exp;
    delete (payload as any).iat;

    // Convert string secret to Buffer
    const secret = Buffer.from(environment.JWT_SECRET, 'utf-8')
    return jwt.sign(payload, secret, { expiresIn: lifeTime });
  } catch (error: any) {
    throw new Error('invalid token refresh ' + error.message)
  }
}

export const _isTokenExpired = async (token: string): Promise<boolean> => {
  try {
    // Convert string secret to Buffer
    const secret = Buffer.from(environment.JWT_SECRET, 'utf-8')
    jwt.verify(token, secret);
    return false;
  } catch (error) {
    return true;
  }
}

export const _checkToken = async (token: string): Promise<jwt.JwtPayload | undefined> => {
  try {
    // Convert string secret to Buffer
    const secret = Buffer.from(environment.JWT_SECRET, 'utf-8')
    const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;
    return decodedToken;
  } catch (error) {
    return undefined;
  }
}



