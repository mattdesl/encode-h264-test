import {
  Muxer,
  ArrayBufferTarget,
} from "https://unpkg.com/mp4-muxer/build/mp4-muxer.mjs";
import { renderer, blobToVideo } from "./shared.js";

const width = 7680 / 2;
const height = 4320 / 2;
const fps = 60;
const duration = 3;

console.time("stream");
let muxer = new Muxer({
  target: new ArrayBufferTarget(),
  video: {
    codec: "avc",
    width,
    height,
  },
  fastStart: "in-memory",
});

let videoEncoder = new VideoEncoder({
  output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
  error: (e) => console.error(e),
});
videoEncoder.configure({
  codec: "avc1.64003e",
  width,
  height,
  bitrate: 1e10,
});

for (let result of renderer({
  width,
  height,
  fps,
  duration,
})) {
  const { canvas, frame: frameIndex, totalFrames } = result;

  const timestamp = (1 / fps) * frameIndex;
  const keyFrame = frameIndex % 30 === 0;

  let frame = new VideoFrame(canvas, {
    timestamp: timestamp * 1000000, // in microseconds
    duration: (1 / fps) * 1000000, // in microseconds
  });

  videoEncoder.encode(frame, { keyFrame });
  frame.close();
  await new Promise((r) => requestAnimationFrame(r));
  console.log(`Progress:`, Math.round((100 * (frameIndex + 1)) / totalFrames));
}

await videoEncoder.flush();
muxer.finalize();

let { buffer } = muxer.target; // Buffer contains final MP4 file
const blob = new Blob([buffer], { type: "video/mp4" });
console.timeEnd("stream");
document.body.appendChild(blobToVideo(blob, width, height));
