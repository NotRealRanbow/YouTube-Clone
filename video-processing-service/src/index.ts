// Import packages
import express, { Request, Response, Application } from "express";
import { 
    uploadProcessedVideo,
    downloadRawVideo,
    deleteRawVideo,
    deleteProcessedVideo,
    convertVideo,
    setupDirectories
  } from './storage';

setupDirectories();

const app: Application = express(); // Initialize express application
app.use(express.json()); // Recieves the standardizes JSON request

// const port = 3000; // Open to port 3000 (default for express applications)

// Anonymous HTTPS endpoint function --> request + response
// app.get("/", (req, res) => {
//     res.send("Hello world!");
// });

// POST request
// Invoked automatically (Cloud Pub/Sub message queue) --> not sent by any user
app.post("/manage-video", (req, res) => {

})


app.post("/process-video", async (req: Request, res: Response): Promise<Response> => {
    // Get the bucket and filename from Cloud Pub/Sub message
    let data;
    try {
        // Parse the message data
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        // Ensure the name (or filename) exists
        if (!data.name) {
            throw new Error('Invalid message payload recieved.');
        }
    } catch (error) {
        // No filename exists
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName)

    // Conver the video to 360p
    try {
        await convertVideo(inputFileName, outputFileName)
    } catch (err) {
        // Groups functions into a promise that can be await together
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]) 
        console.error(err);
        return res.status(500).send('Internal Server Error: video processing failed.')
    }

    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]) 

    return res.status(200).send('Processing finished successfully.');
});

const port = process.env.PORT || 3000; // Port can be provided as environment variable upon runtime. Set to 3000 as default when it's undefined.

// Start server
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});