import { useEffect, useRef } from "react";

const womanImage = new URL("../../animated.jpeg", import.meta.url).href;

export default function FloatingMascot({ compact = false, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return undefined;

    const source = new Image();
    source.crossOrigin = "anonymous";

    let processed = null;

    const buildProcessedCanvas = () => {
      const offscreen = document.createElement("canvas");
      offscreen.width = source.naturalWidth;
      offscreen.height = source.naturalHeight;
      const off = offscreen.getContext("2d", { willReadFrequently: true });
      if (!off) return null;

      off.drawImage(source, 0, 0);
      const img = off.getImageData(0, 0, offscreen.width, offscreen.height);
      const data = img.data;
      const width = offscreen.width;
      const height = offscreen.height;
      const visited = new Uint8Array(width * height);
      const queue = new Uint32Array(width * height);
      let qh = 0;
      let qt = 0;

      const isNearBlack = (r, g, b) => {
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max - min;
        // Keep dark hair/eyes by only removing very close-to-pure black.
        return luma < 14 && saturation < 14 && max < 28;
      };

      const pushIfBg = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (visited[p]) return;
        const i = p * 4;
        if (isNearBlack(data[i], data[i + 1], data[i + 2])) {
          visited[p] = 1;
          queue[qt++] = p;
        }
      };

      // Flood-fill only from canvas borders so we remove outer backdrop only.
      for (let x = 0; x < width; x += 1) {
        pushIfBg(x, 0);
        pushIfBg(x, height - 1);
      }
      for (let y = 0; y < height; y += 1) {
        pushIfBg(0, y);
        pushIfBg(width - 1, y);
      }

      while (qh < qt) {
        const p = queue[qh++];
        const x = p % width;
        const y = (p - x) / width;
        const i = p * 4;
        data[i + 3] = 0;

        pushIfBg(x + 1, y);
        pushIfBg(x - 1, y);
        pushIfBg(x, y + 1);
        pushIfBg(x, y - 1);
      }

      off.putImageData(img, 0, 0);
      return offscreen;
    };

    const renderStatic = () => {
      if (!processed) return;

      const width = processed.width;
      const height = processed.height;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(processed, 0, 0, width, height);
    };

    source.onload = () => {
      processed = buildProcessedCanvas();
      if (!processed) return;
      renderStatic();
    };
    source.src = womanImage;

    return () => {};
  }, []);

  return (
    <div className={`floatingMascot ${compact ? "compact" : ""} ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} className="floatingMascotCanvas" />
    </div>
  );
}

