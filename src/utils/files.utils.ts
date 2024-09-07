import fs from "fs";
import path from "path";

/**
 * Deletes a file from the filesystem.
 * @param filePath - The relative path to the file to be deleted.
 * @returns A promise that resolves if the file was deleted successfully or rejects with an error.
 */
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Resolve the full path to the file
    const fullPath = path.join(__dirname, filePath);

    // Use fs.unlink to delete the file
    fs.unlink(fullPath, (err) => {
      if (err) {
        reject(new Error(`Failed to delete file: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
};

