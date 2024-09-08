import path from "path";
import { environment } from "./loadEnvironment";

export function formattingAttachmentUrl(url: string) {
//   return path.join(environment.S3_BUCKET_HOST || environment.HOST, url);
    return url;
}

function log(...messages: unknown[]) {
    const currentDate = new Date();
    console.log(currentDate.toISOString(), " : ", ...messages);
}

function error(...messages: unknown[]) {
    const currentDate = new Date();
    console.error(currentDate, " : ", ...messages);
}

export const logs = {
    log,
    error
}