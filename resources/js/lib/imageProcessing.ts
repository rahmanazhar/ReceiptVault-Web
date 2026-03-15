/**
 * Receipt Image Processing Utilities
 *
 * Uses jscanify + OpenCV.js (loaded via CDN) for document extraction:
 * - Contour detection, perspective correction, background removal
 *
 * Uses Canvas API for enhancement filters:
 * - Grayscale, contrast, adaptive threshold, sharpen
 *
 * Goal: make receipt photos look like flatbed scanner output.
 */

// ─── Image Loading ──────────────────────────────────────────────────────────

export function loadImageToCanvas(source: File | Blob | string): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d')!.drawImage(img, 0, 0);
            resolve(canvas);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        if (typeof source === 'string') {
            img.src = source;
        } else {
            img.src = URL.createObjectURL(source);
        }
    });
}

// ─── OpenCV.js Readiness ────────────────────────────────────────────────────

export function waitForOpenCv(timeoutMs = 30000): Promise<boolean> {
    return new Promise((resolve) => {
        const isReady = () =>
            typeof cv !== 'undefined' &&
            typeof cv.Mat !== 'undefined' &&
            typeof jscanify !== 'undefined';

        if (isReady()) {
            resolve(true);
            return;
        }

        const start = Date.now();
        const check = () => {
            if (isReady()) {
                resolve(true);
            } else if (Date.now() - start > timeoutMs) {
                resolve(false);
            } else {
                setTimeout(check, 300);
            }
        };
        check();
    });
}

// ─── Document Extraction (jscanify + OpenCV.js) ────────────────────────────

/**
 * Extract paper from image using jscanify.
 * jscanify uses OpenCV.js internally to:
 * - Detect document contours
 * - Find the 4 corners of the paper
 * - Apply perspective correction
 * - Return ONLY the paper as a clean, straightened rectangle
 */
export async function extractDocument(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
    const ready = await waitForOpenCv();
    if (!ready) return canvas;

    const scanner = new jscanify();
    const result = scanner.extractPaper(canvas, canvas.width, canvas.height);
    return result || canvas;
}

// ─── Enhancement Filters ────────────────────────────────────────────────────

function cloneCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    copy.getContext('2d')!.drawImage(canvas, 0, 0);
    return copy;
}

export function grayscale(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

export function contrastStretch(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] < min) min = data[i];
        if (data[i] > max) max = data[i];
    }
    const range = max - min || 1;
    for (let i = 0; i < data.length; i += 4) {
        const v = Math.round(((data[i] - min) / range) * 255);
        data[i] = data[i + 1] = data[i + 2] = v;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

export function adaptiveThreshold(canvas: HTMLCanvasElement, windowSize = 15, offset = 10): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data);
    const half = Math.floor(windowSize / 2);

    const integral = new Float64Array(width * height);
    for (let y = 0; y < height; y++) {
        let rowSum = 0;
        for (let x = 0; x < width; x++) {
            rowSum += data[(y * width + x) * 4];
            integral[y * width + x] = rowSum + (y > 0 ? integral[(y - 1) * width + x] : 0);
        }
    }

    const getAreaSum = (x1: number, y1: number, x2: number, y2: number) => {
        x1 = Math.max(0, x1); y1 = Math.max(0, y1);
        x2 = Math.min(width - 1, x2); y2 = Math.min(height - 1, y2);
        let sum = integral[y2 * width + x2];
        if (x1 > 0) sum -= integral[y2 * width + (x1 - 1)];
        if (y1 > 0) sum -= integral[(y1 - 1) * width + x2];
        if (x1 > 0 && y1 > 0) sum += integral[(y1 - 1) * width + (x1 - 1)];
        return sum;
    };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const count = (Math.min(x + half, width - 1) - Math.max(x - half, 0) + 1) *
                          (Math.min(y + half, height - 1) - Math.max(y - half, 0) + 1);
            const avg = getAreaSum(x - half, y - half, x + half, y + half) / count;
            const i = (y * width + x) * 4;
            const val = data[i] > avg - offset ? 255 : 0;
            output[i] = output[i + 1] = output[i + 2] = val;
            output[i + 3] = 255;
        }
    }

    ctx.putImageData(new ImageData(output, width, height), 0, 0);
    return canvas;
}

export function sharpen(canvas: HTMLCanvasElement, amount = 1): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data);
    const center = 1 + 4 * amount;
    const side = -amount;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                const idx = (y * width + x) * 4 + c;
                const val = data[idx] * center +
                    data[((y-1)*width+x)*4+c] * side + data[((y+1)*width+x)*4+c] * side +
                    data[(y*width+(x-1))*4+c] * side + data[(y*width+(x+1))*4+c] * side;
                output[idx] = Math.max(0, Math.min(255, Math.round(val)));
            }
        }
    }
    ctx.putImageData(new ImageData(output, width, height), 0, 0);
    return canvas;
}

export function adjustBrightnessContrast(canvas: HTMLCanvasElement, brightness: number, contrast: number): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            let val = data[i + c] + brightness;
            val = factor * (val - 128) + 128;
            data[i + c] = Math.max(0, Math.min(255, Math.round(val)));
        }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

// ─── Rotation ───────────────────────────────────────────────────────────────

export function rotateImage(canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
    const normalized = ((degrees % 360) + 360) % 360;
    if (normalized === 0) return canvas;

    const rotated = document.createElement('canvas');
    const ctx = rotated.getContext('2d')!;
    const rad = (normalized * Math.PI) / 180;
    const isVerticalFlip = normalized === 90 || normalized === 270;

    rotated.width = isVerticalFlip ? canvas.height : canvas.width;
    rotated.height = isVerticalFlip ? canvas.width : canvas.height;

    ctx.translate(rotated.width / 2, rotated.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    return rotated;
}

// ─── Full Enhancement Pipeline ──────────────────────────────────────────────

export async function enhanceReceipt(canvas: HTMLCanvasElement, options: {
    extract?: boolean;
    threshold?: boolean;
    sharpenAmount?: number;
} = {}): Promise<HTMLCanvasElement> {
    const { extract = true, threshold = true, sharpenAmount = 0.5 } = options;

    let result = cloneCanvas(canvas);

    // Step 1: Extract document (OpenCV - removes background, straightens)
    if (extract) {
        result = await extractDocument(result);
    }

    // Step 2: Enhance for scanner look
    result = grayscale(result);
    result = contrastStretch(result);

    if (threshold) {
        result = adaptiveThreshold(result, 15, 12);
    }

    if (sharpenAmount > 0) {
        result = sharpen(result, sharpenAmount);
    }

    return result;
}

// ─── Export Utilities ───────────────────────────────────────────────────────

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
            type, quality
        );
    });
}

export function canvasToDataUrl(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): string {
    return canvas.toDataURL(type, quality);
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, type = 'image/jpeg', quality = 0.92): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(type, quality);
    link.click();
}

export async function downloadFromUrl(url: string, filename: string): Promise<void> {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = blobUrl;
    link.click();
    URL.revokeObjectURL(blobUrl);
}
