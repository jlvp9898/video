const fs = require( 'fs');
const path = require('path');
const { loadImage } = require('canvas');
var extractFramesFromVideo  = require('./extractFramesFromVideo.js');

/* Example usage:
  const getNextFrame = await getVideoFrameReader('video.mp4', 'tmp', 60);
  await getNextFrame();    // Returns frame 1
  await getNextFrame();    // Returns frame 2
  await getNextFrame();    // Returns frame 3
*/
module.exports = async function getVideoFrameReader(videoFilepath, tmpDir, frameRate) {

  // Extract frames using FFmpeg
  if(videoFilepath.length > 0){
    await extractFramesFromVideo(videoFilepath, path.join(tmpDir, 'frame-%04d.jpg'), frameRate);

  }
  
  // Get the filepaths to the frames and sort them alphabetically
  // so we can read them back in the right order
  const filepaths = (await fs.promises.readdir(tmpDir))
    .map(file => path.join(tmpDir, file))
    .sort();

  let frameNumber = 0;

  // Return a function that returns the next frame every time it is called
  return async () => {

    // Load a frame image
    const frame = await loadImage(filepaths[frameNumber]);

    // Next time, load the next frame
    if (frameNumber < filepaths.length - 1) {
      frameNumber++;
    }

    return frame;
  };
}