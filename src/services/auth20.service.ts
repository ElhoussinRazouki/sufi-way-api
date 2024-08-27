import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { environment } from '../utils/loadEnvironment';


passport.use(
    new GoogleStrategy({
        clientID: environment.GOOGLE_CLIENT_ID,
        clientSecret: environment.GOOGLE_CLIENT_SECRET,
        callbackURL: environment.GOOGLE_AUTH_CALLBACK,
        scope: ["profile", "email"]
    }, async (accessToken: string, refreshToken: string, profile: any, callback: CallableFunction)=>{
        try {
            return callback(null, profile);
        } catch (error: any) {
            return callback(error);
        } 
    })
)

export default passport; 