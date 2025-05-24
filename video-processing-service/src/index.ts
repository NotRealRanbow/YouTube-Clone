// Import packages
import express from "express"; 
import ffmpeg from "fluent-ffmpeg"; // Command line interface tool (only lets us use it outside of cli -- tool must be installed separately)


const app = express(); // Initialize express application
app.use(express.json()); // Recieves the standardizes JSON request

// const port = 3000; // Open to port 3000 (default for express applications)

// Anonymous HTTPS endpoint function --> request + response
// app.get("/", (req, res) => {
//     res.send("Hello world!");
// });

// POST request
app.post("/process-video", (req, res) => {
    // Get path of the input video file from the request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    // Error handling for empty file paths
    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request: Missing file path.");
    }

    // Convert video to 360p
    ffmpeg(inputFilePath)
        // -vf = video file
        // Scale to 360p
        .outputOptions("-vf", "scale=-1:360")
        // When process completes (end tag)
        .on("end", () => {
            // Asynchronous function, so must wait until the end
            return res.status(200).send("Video processing finished successfully.") // Code 200 - successful upload
        })
        // Error
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`)
            res.status(500).send(`Internal Server Error: ${err.message}`) // Error code 500 - interal error
        })
        // Save output file with path
        .save(outputFilePath);
});

const port = process.env.PORT || 3000; // Port can be provided as environment variable upon runtime. Set to 3000 as default when it's undefined.

// Start server
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});