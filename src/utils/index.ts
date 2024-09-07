import path from "path";
import { environment } from "./loadEnvironment";

export function formattingAttachmentUrl(url: string) {
  return path.join(environment.S3_BUCKET_HOST || environment.HOST, url);
}