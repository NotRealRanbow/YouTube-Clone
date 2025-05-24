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

}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert from {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
}