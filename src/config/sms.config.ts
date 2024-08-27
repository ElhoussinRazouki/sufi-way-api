import twilio from 'twilio';
import { environment } from '../utils/loadEnvironment';


export const client = twilio(environment.TWILIO_ACCOUNT_SID, environment.TWILIO_AUTH_TOKEN);