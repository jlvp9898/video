var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');

// Example usage: await extractFramesFromVideo('video.mp4', 'frame-%04d.png', 60);
module.exports = async function extractFramesFromVideo(inputFilepath, outputFilepath, frameRate) {

  await new Promise((resolve, reject) => {
    ffmpeg().setFfmpegPath(ffmpegPath)

      // Specify the filepath to the video
      .input(inputFilepath)

      // Instruct FFmpeg to extract frames at this rate regardless of the video's frame rate
      .fps(frameRate)

      // Save frames to this directory
      .saveToFile(outputFilepath)

      .on('end', () => resolve())
      .on('error', (error) => reject(new Error(error)));
  });
}