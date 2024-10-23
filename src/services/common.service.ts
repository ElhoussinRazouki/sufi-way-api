import { Users } from "../models/user.schema";
import { AskSheikhPayload, AskSheikhPayloadType, AskSupportPayload, AskSupportPayloadType } from "../types/general.settings.types";
import mailerService from "./mailer.service";


async function askSheikh(userId: string, payload: AskSheikhPayloadType) {

    const userDb = await Users.findById(userId).select('lastTimeAskSheikh');
    // limit to 1 question per day
    if (userDb && userDb.lastTimeAskSheikh && new Date().getTime() - userDb.lastTimeAskSheikh.getTime() < 24 * 60 * 60 * 1000) {
        throw new Error('يمكنك طرح سؤال واحد فقط في اليوم');
    }

    await AskSheikhPayload.validate(payload);
    await mailerService.askSheikh(payload);
    await Users.updateOne({ _id: userId }, { lastTimeAskSheikh: new Date() });
    return true;
}

async function contactSupport(userId: string, payload: AskSupportPayloadType) {

    const userDb = await Users.findById(userId).select('lastTimeAskSupport');
    // limit to 1 question per day
    if (userDb && userDb.lastTimeAskSupport && new Date().getTime() - userDb.lastTimeAskSupport.getTime() < 24 * 60 * 60 * 1000) {
        throw new Error('لقد تلقينا سؤالك بالفعل وسوف نتصل بك في أقرب وقت ممكن.');
    }

    await AskSupportPayload.validate(payload);
    await mailerService.contactSupport(payload);
    await Users.updateOne({ _id: userId }, { lastTimeAskSupport: new Date() });
    return true;
}

export const commonService = { askSheikh, contactSupport };