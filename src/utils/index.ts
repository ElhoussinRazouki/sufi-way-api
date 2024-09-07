import path from "path";
import { environment } from "./loadEnvironment";

export function formattingAttachmentUrl(url: string) {
  return path.join(environment.S3_BUCKET_HOST || environment.HOST, url);
}

function log(...messages: unknown[]) {
    const currentDate = new Date();
    logs.log(currentDate.toISOString(), " : ", ...messages);
}

function error(...messages: unknown[]) {
    const currentDate = new Date();
    logs.error(currentDate, " : ", ...messages);
}

export const logs = {
    log,
    error
}