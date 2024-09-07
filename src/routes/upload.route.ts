import { Router } from "express";
import uploadFileFactory from "../middlewares/upload.middleware";

export const attachmentRouter = Router();


// Route to upload images with a 3 MB limit
attachmentRouter.post("/upload-image", uploadFileFactory("image", 3 * 1024 * 1024));

// Route to upload PDFs with a 10 MB limit
attachmentRouter.post("/upload-pdf", uploadFileFactory("pdf", 20 * 1024 * 1024));

// Route to upload audio with a 10 MB limit
attachmentRouter.post("/upload-audio", uploadFileFactory("audio", 50 * 1024 * 1024));

// Route to upload videos with a 60 MB limit
attachmentRouter.post("/upload-video", uploadFileFactory("video", 100 * 1024 * 1024));
