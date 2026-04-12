import * as ort from "onnxruntime-web";

const ORT_VERSION = "1.24.3";

const MODEL_URLS = [
  "https://huggingface.co/onnx-community/Deep-Fake-Detector-v2-Model-ONNX/resolve/main/onnx/model_q4f16.onnx",
  "https://huggingface.co/onnx-community/Deep-Fake-Detector-v2-Model-ONNX/resolve/main/onnx/model_int8.onnx",
  "https://huggingface.co/onnx-community/Deep-Fake-Detector-v2-Model-ONNX/resolve/main/onnx/model_fp16.onnx",
];

let sessionPromise = null;

function configureWasm() {
  ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
  ort.env.wasm.numThreads = 1;
}

function imageToPixelValuesCHW(imageSource) {
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(imageSource, 0, 0, 224, 224);
  const { data } = ctx.getImageData(0, 0, 224, 224);
  const out = new Float32Array(1 * 3 * 224 * 224);
  let p = 0;
  for (let c = 0; c < 3; c += 1) {
    for (let y = 0; y < 224; y += 1) {
      for (let x = 0; x < 224; x += 1) {
        const i = (y * 224 + x) * 4;
        const v = (data[i + c] / 255 - 0.5) / 0.5;
        out[p] = v;
        p += 1;
      }
    }
  }
  return out;
}

function deepfakePercentFromLogits(logits) {
  if (!logits || logits.length < 2) {
    throw new Error("Unexpected model output shape");
  }
  const a = Number(logits[0]);
  const b = Number(logits[1]);
  const sum = Math.abs(a) + Math.abs(b);
  if (sum > 0 && a >= 0 && b >= 0 && a <= 1 && b <= 1 && Math.abs(a + b - 1) < 0.02) {
    return Math.round(b * 100);
  }
  const m = Math.max(a, b);
  const e0 = Math.exp(a - m);
  const e1 = Math.exp(b - m);
  const pFake = e1 / (e0 + e1);
  return Math.round(pFake * 100);
}

async function createSession() {
  configureWasm();
  const custom = import.meta.env.VITE_DEEPFAKE_ONNX_URL;
  const urls = [custom, ...MODEL_URLS].filter(Boolean);
  let lastErr;
  for (const url of urls) {
    try {
      return await ort.InferenceSession.create(url, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Failed to load ONNX model");
}

export function getDeepfakeSession() {
  if (!sessionPromise) sessionPromise = createSession();
  return sessionPromise;
}

export async function predictDeepfakeFromImageSource(imageSource) {
  const session = await getDeepfakeSession();
  const pixelValues = imageToPixelValuesCHW(imageSource);
  const inputName = session.inputNames[0];
  const inputTensor = new ort.Tensor("float32", pixelValues, [1, 3, 224, 224]);
  const feeds = { [inputName]: inputTensor };
  const outputs = await session.run(feeds);
  const outName = session.outputNames[0];
  const tensor = outputs[outName];
  if (!tensor?.data) throw new Error("Model returned no data");
  const logits =
    tensor.data instanceof Float32Array
      ? tensor.data
      : Float32Array.from(tensor.data);
  return deepfakePercentFromLogits(logits);
}

export async function predictDeepfakeFromImageFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please choose an image file for ONNX analysis.");
  }
  const url = URL.createObjectURL(file);
  try {
    try {
      const bmp = await createImageBitmap(file);
      try {
        return await predictDeepfakeFromImageSource(bmp);
      } finally {
        bmp.close?.();
      }
    } catch {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Could not read image"));
        el.src = url;
      });
      return await predictDeepfakeFromImageSource(img);
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}
