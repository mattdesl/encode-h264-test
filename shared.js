let link;

export function blobToVideo(blob, width, height) {
  const video = document.createElement("video");
  video.setAttribute("muted", "muted");
  video.setAttribute("autoplay", "autoplay");
  video.setAttribute("controls", "controls");
  const min = Math.min(width, window.innerWidth, window.innerHeight);
  const aspect = width / height;
  const size = min * 0.75;
  video.style.width = `${size}px`;
  video.style.height = `${size / aspect}px`;
  const url = URL.createObjectURL(blob);
  video.src = url;

  const link = document.createElement("a");
  link.download = `${getTimestamp()}.mp4`;
  link.href = url;
  link.textContent = "Download MP4...";

  const container = document.createElement("div");
  container.style.cssText = "display: flex; flex-direction: column;";
  container.appendChild(video);
  container.appendChild(link);
  return container;
}

export function* renderer(opts = {}) {
  const { fps = 60, duration = 4, width = 1920, height = 1080 } = opts;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });
  canvas.width = width;
  canvas.height = height;

  const totalFrames = Math.ceil(fps * duration);
  const deltaTime = 1 / fps;
  for (let i = 0, time = 0; i < totalFrames; i++, time += deltaTime) {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const m = width * 0.1;
    const grad = context.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "hsl(50, 50%, 50%)");
    grad.addColorStop(1, "hsl(100, 80%, 50%)");
    context.fillStyle = grad;
    context.fillRect(m, m, width - m * 2, height - m * 2);

    const playhead = time / duration;
    const x = playhead * width;
    const y = height / 2;
    const r = Math.min(width, height) / 4;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.fillStyle = "gray";
    context.fill();

    yield {
      context,
      canvas,
      frame: i,
      totalFrames,
      time,
    };
  }
}

export function downloadBuffer(buf, opts = {}) {
  const { filename = "download" } = opts;
  const blob = new Blob([buf], opts);
  return downloadBlob(blob, { filename });
}

export function downloadBlob(blob, opts = {}) {
  return new Promise((resolve) => {
    const filename = opts.filename || getTimestamp();
    if (!link) {
      link = document.createElement("a");
      link.style.visibility = "hidden";
      link.target = "_blank";
    }
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.onclick = () => {
      link.onclick = () => {};
      setTimeout(() => {
        window.URL.revokeObjectURL(blob);
        if (link.parentElement) link.parentElement.removeChild(link);
        link.removeAttribute("href");
        resolve({ filename });
      });
    };
    link.click();
  });
}

export function getTimestamp() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let [mm, dd, hh, min, sec] = [
    today.getMonth() + 1, // Months start at 0!
    today.getDate(),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  ].map((c) => String(c).padStart(2, "0"));
  return `${yyyy}.${mm}.${dd}-${hh}.${min}.${sec}`;
}
