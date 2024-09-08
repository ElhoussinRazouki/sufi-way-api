import util from "util";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { minioClient } from "../config/cloud.storage.config";
import { environment } from "../utils/loadEnvironment";

// Define allowed file types
type FileType = "image" | "video" | "audio" | "pdf";

// Function to determine the folder path based on file type
const getFileTypeFolder = (fileType: FileType): string | null => {
    switch (fileType) {
        case "image":
            return "images";
        case "video":
            return "videos";
        case "audio":
            return "audio";
        case "pdf":
            return "pdf";
        default:
            return null;
    }
};

// Factory function to return the multer middleware
const uploadFileMiddleware = (allowedFileType: FileType, maxSize: number = 2 * 1024 * 1024) => {
    // In-memory storage for Multer
    let storage = multer.memoryStorage();

    let uploadFile = multer({
        storage: storage,
        limits: { fileSize: maxSize },
        fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
            // Get MIME type from the file and ensure it matches the allowedFileType
            const isAllowed =
                (allowedFileType === "image" && file.mimetype.startsWith("image/")) ||
                (allowedFileType === "video" && file.mimetype.startsWith("video/")) ||
                (allowedFileType === "audio" && file.mimetype.startsWith("audio/")) ||
                (allowedFileType === "pdf" && file.mimetype === "application/pdf");

            if (isAllowed) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type. Only ${allowedFileType} files are allowed.`));
            }
        },
    }).single("file");

    // Promisify the middleware
    let uploadMiddleware = util.promisify(uploadFile);

    return async (req: Request, res: Response, next?: NextFunction) => {
        try {
            await uploadMiddleware(req, res);
            if (!req.file) {
                return res.status(400).send({ message: "Please upload a file!" });
            }

            const file = req.file;
            if (!file) {
                return res.status(400).send({ message: "No file uploaded!" });
            }

            // Generate unique file name using UUID
            const fileExtension = file.originalname.split('.').pop();
            const uniqueName = uuidv4() + (fileExtension ? `.${fileExtension}` : '');

            const folder = getFileTypeFolder(allowedFileType);
            if (!folder) {
                return res.status(400).send({ message: "Invalid file type." });
            }

            // Upload to MinIO
            minioClient.putObject(
                environment.MINIO_BUCKET_NAME,
                `/attachments/${folder}/${uniqueName}`, 
                file.buffer, 
                file.size, 
                { 'Content-Type': file.mimetype },
            ).then(() => {
                return res.status(200).send({
                data: `${environment.MINIO_HOST}/${environment.MINIO_BUCKET_NAME}/attachments/${folder}/${uniqueName}`,
                });
            }).catch((err) => {
                return res.status(500).send({
                    message: `Could not upload the file: ${(err as Error).message}`,
                });
            });
        } catch (err) {
            return res.status(500).send({
                message: `Could not upload the file: ${(err as Error).message}`,
            });
        }
    };
};

export default uploadFileMiddleware;
