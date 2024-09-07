import util from "util";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

// Define allowed file types
type FileType = "image" | "video" | "audio" | "pdf";

// Function to determine destination folder based on file type
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
    let storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const folder = getFileTypeFolder(allowedFileType);
            if (folder) {
                const uploadPath = path.join(__dirname, `../../attachments/${folder}`);

                try {
                    // Check if the folder exists, if not, create it
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                } catch (err) {
                    cb(new Error(`Failed to create directory: ${(err as Error).message}`), "");
                }
            } else {
                cb(new Error("Invalid file type"), "");
            }
        },
        filename: (req, file, cb) => {
            // Generate unique file name using UUID
            const fileExtension = path.extname(file.originalname);
            const uniqueName = uuidv4() + fileExtension;
            cb(null, uniqueName);

            // Store the generated file name in req object to retrieve later
            (req as any).uploadedFileName = uniqueName;
        },
    });

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

            // Build file path without host, just from the attachments folder
            const folder = getFileTypeFolder(allowedFileType);
            const filePath = `/attachments/${folder}/${(req as any).uploadedFileName}`;

            // Return file path in response
            return res.status(200).send({ filePath });
        } catch (err) {
            return res.status(500).send({
                message: `Could not upload the file: ${(err as Error).message}`,
            });
        }
    };
};

export default uploadFileMiddleware;
