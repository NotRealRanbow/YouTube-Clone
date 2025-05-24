// Manages communication with Google Cloud Storage (GCS)
// 1. GCS file interactions
// 2. Local file interactions

import { Storage } from '@google-cloud/storage';
import fs from 'fs'; // Node.js native file system
import ffmpeg from 'fluent-ffmpeg';

// GCS instance
const storage = new Storage();

// MUST be globally unique names (no other person has declared the same string)
// Bucket for raw/uploaded videos
const rawVideoBucketName = "320-raw-videos";
// Bucket for processed videos
const processedVideoBucketName = "320-processed-videos";

// After video is processed in bucket, delete raw & processed videos to save space
// Put raw videos in the folder path of local system
const localRawVideoPath = "./raw-videos";
// Put processed videos in the folder path of local system
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert from {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 * Cannot use rs since storage.ts is not authorized to give responses
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    // Create a promise that allows us to through a sucessful message or error to index.ts
    return new Promise<void>((resolve, reject) => {
        // Convert video to 360p
        // `${}` for f-strings
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        // -vf = video file
        // Scale to 360p
        .outputOptions("-vf", "scale=-1:360")
        // When process completes (end tag)
        .on("end", () => {
            // Asynchronous function, so must wait until the end
            console.log("Video processing finished successfully.") // Code 200 - successful upload
            resolve();
        })
        // Error
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`)
            reject(err);
        })
        // Save output file with path
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}


/**
 * @param fileName - The name of the file to download from the 
 * {@link processedVideoBucketName} folder into the {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function downloadRawVideo(fileName: string) {
    // Specify bucket
    await storage.bucket(rawVideoBucketName)
        // Specify file
        .file(fileName)
        // Specify action -- download
        .download({ destination: `${localRawVideoPath}/${fileName}` })
// Await blocks the following code to start until the asynchronous process is finished
console.log(
    // GCS buckets are prefixed by gs (Google Storage)
    `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`
)
}

/**
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    })
    console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`)
    // Make file available to the public
    await bucket.file(fileName).makePublic();
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promis that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            // Unlink to remove file
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file at ${filePath}`);
                    console.log(JSON.stringify(err));
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            })
        } else {
            console.log(`File not found at ${filePath}, skipping the delete.`)
            resolve();
        }
    });
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promis that resolves when the file has been deleted.
 */
export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`)
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localProcessedVideoPath} folder.
 * @returns A promis that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`)
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}