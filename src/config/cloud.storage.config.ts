import { S3Client, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { environment } from '../utils/loadEnvironment';



const BUCKET_NAME = 'sufi-tariqa'

export const s3Client = new S3Client({
    endpoint: environment.S3_ENDPOINT,
    region: "us-east-1",
    credentials: {
        accessKeyId: environment.S3_ACCESS_KEY,
        secretAccessKey: environment.S3_SECRET_KEY,
    },
    forcePathStyle: true,
    tls: true
})

async function ensureBucketExists() {
    try {
      // Check if bucket exists
      const headBucketCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
      await s3Client.send(headBucketCommand);
      console.log("Connected Successfully to Cloud Bucket");
    } catch (error) {
      if (error instanceof Error && (error.name === "NotFound" || error.name === "NoSuchBucket")) {
        console.log("Bucket does not exist. Creating it now...");
        try {
          const createBucketCommand = new CreateBucketCommand({ Bucket: BUCKET_NAME });
          await s3Client.send(createBucketCommand);
          console.log("Bucket created successfully.");
        } catch (createError) {
          console.error("Error occurred while creating bucket:", createError);
        }
      } else {
        console.error("Error occurred while checking bucket existence:", error);
      }
    }
  }
  
  ensureBucketExists();