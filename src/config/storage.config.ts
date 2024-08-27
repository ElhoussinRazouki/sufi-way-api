import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { generateRandomCharacters } from '../utils/string.format';


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the upload directory
        const uploadDir = './uploads';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // extract file extension
        const ext = path.extname(file.originalname);
        const fileName = generateRandomCharacters(48)+ext;
        cb(null, fileName);
    }
});


// Create upload instance
export const multerAvatarUpload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and GIF files are allowed'));
        }
    }
 });
