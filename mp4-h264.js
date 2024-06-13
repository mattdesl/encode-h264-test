import { renderer, blobToVideo } from "./shared.js";

const width = 7680 / 2;
const height = 4320 / 2;
const fps = 60;
const duration = 3;

const settings = {
  sequential: true,
  width,
  height,
  fps,
  stride: 4,
};

const worker = new Worker(new URL("./encoder.worker.js", import.meta.url), {
  type: "module",
});

const waitForEvent = async (worker, ev) => {
  return new Promise((resolve) => {
    const handler = ({ data }) => {
      if (data.event === ev) {
        worker.removeEventListener("message", handler);
        resolve(data);
      }
    };
    worker.addEventListener("message", handler);
  });
};

await waitForEvent(worker, "ready");

console.time("stream");

worker.postMessage({ event: "start", settings });

for (let result of renderer({
  width,
  height,
  fps,
  duration,
})) {
  const { frame, totalFrames, context } = result;
  const image = context.getImageData(0, 0, width, height);
  const pixels = image.data;
  worker.postMessage({ event: "frame", buffer: pixels }, [pixels.buffer]);
  await new Promise((r) => requestAnimationFrame(r));
  console.log(`Progress:`, Math.round((100 * (frame + 1)) / totalFrames));
}

worker.postMessage({ event: "finish" });

const { buffer } = await waitForEvent(worker, "end");
const blob = new Blob([buffer], { type: "video/mp4" });
console.timeEnd("stream");
document.body.appendChild(blobToVideo(blob, width, height));
