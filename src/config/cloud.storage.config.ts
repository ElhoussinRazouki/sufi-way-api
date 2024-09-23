import * as Minio from 'minio'
import { environment } from '../utils/loadEnvironment';
import { logs } from '../utils';



const BUCKET_NAME = 'sufi-tariqa'

export const minioClient = new Minio.Client({
    endPoint: environment.MINIO_ENDPOINT,
    useSSL: true,
    accessKey: environment.MINIO_ACCESS_KEY,
    secretKey: environment.MINIO_SECRET_KEY,
})

// check if the bucket exists, if not create it
minioClient.bucketExists(BUCKET_NAME).then((exists) => {
    if(exists){
        logs.log('Connected Successfully to Cloud Bucket');
    }else{
        logs.log('Bucket does not exist. Creating it now...')
        minioClient.makeBucket(BUCKET_NAME, 'us-east-1').then(() => {
            logs.log('Bucket created successfully.')
        }).catch((error) => {
            logs.log('Error occurred. creating bucket', error)
        })
    }
}).catch((error) => {
    logs.error('Error occurred. checking if the bucket exist ', error)
})