import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { scheduleJob } from "node-schedule";
import { s3Client } from "../config/cloud.storage.config";
import { environment } from "../utils/loadEnvironment";
import { Author, MultiMedia } from "../models/multimedia.schema";
import { Zawya } from "../models/zawya.schema";
import { News } from "../models/news.schema";

async function listFilesInFolder(bucket: string, prefix: string) {
    let continuationToken: string | undefined = undefined;
    const fileList: string[] = [];

    try {
        do {
            const command: ListObjectsV2Command = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            });

            const response = await s3Client.send(command);
            if (response.Contents) {
                response.Contents.forEach((item) => {
                    if (item.Key) {
                        fileList.push(item.Key);
                    }
                });
            }

            continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
        } while (continuationToken);

        return fileList;
    } catch (error) {
        console.error("Error listing files:", error);
        return [];
    }
}

async function deleteFiles(bucket: string, keys: string[]) {
    if(keys.length === 0) return;
    try {
        const command = new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
                Objects: keys.map((key) => ({ Key: key })),
                Quiet: false,
            },
        });

        const response = await s3Client.send(command);
        console.log(`Files deleted successfully:`, response.Deleted);
        if (response.Errors && response.Errors.length > 0) {
            console.error("Errors occurred:", response.Errors);
        }
    } catch (error) {
        console.error("Error deleting files:", error);
    }
}
async function getAllBucketFiles() {
    const list = await listFilesInFolder(environment.MINIO_BUCKET_NAME, "attachments/");
    return list;
}

async function getAllDataBaseUsedFiles() {

    // get all files from the database for comparison with the bucket files
    const multimediaList = await MultiMedia.find().select("url");
    const multimediaFilesList = multimediaList.map((item) => item.url).filter((url) => url && typeof url === 'string') || [];

    const AuthorsList = await Author.find().select("avatar");
    const AuthorsFilesList = AuthorsList.map((item) => item.avatar).filter((url) => url && typeof url === 'string') || [];

    const ZawyaList = await Zawya.find().select("avatar");
    const ZawyaFilesList = ZawyaList.map((item) => item.avatar).filter((url) => url && typeof url === 'string') || [];

    const NewsList = await News.find().select("url");
    const NewsFilesList = NewsList.map((item) => item.url).filter((url) => url && typeof url === 'string') || [];

    const AllDatabaseFiles = [...multimediaFilesList, ...AuthorsFilesList, ...ZawyaFilesList, ...NewsFilesList] as string[];

    // extract only the actual path in the bucket
    const AllDatabaseFilesPaths = AllDatabaseFiles.map((url) => url.split(environment.MINIO_BUCKET_NAME + "/")[1]);
    return AllDatabaseFilesPaths;
}

async function cleanBucket() {
    console.log("cleaning bucket starts...");
    const bucketFiles = await getAllBucketFiles();
    const databaseFiles = await getAllDataBaseUsedFiles();

    // get the files that are not in the database
    const filesToDelete = bucketFiles.filter((file) => !databaseFiles.includes(file));

    console.log("bucket files: ", bucketFiles.length);
    console.log("database files: ", databaseFiles.length);
    console.log("files to delete: ", filesToDelete.length);

    // delete the files
    // check the length of the files to delete to avoid unnecessary calls to the delete function
    if (filesToDelete.length > 0){
        await deleteFiles(environment.MINIO_BUCKET_NAME, filesToDelete);
    }else{
        console.log("no files to delete");
    }

}

export function scheduleBucketCleaner() {
    console.log("scheduling bucket cleaner...");
    // run the cleaner every day at 2:00 AM
    scheduleJob("0 2 * * *", cleanBucket);
}