/**
 * Receipt Image Processing Utilities
 * Uses HTML5 Canvas API for client-side image enhancement.
 * Makes receipt photos look like clean scanned documents.
 */

/**
 * Load an image file or blob into an HTMLCanvasElement.
 */
export function loadImageToCanvas(source: File | Blob | string): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
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

/**
 * Detect document edges and return the bounding box of content.
 * Uses contrast-based edge detection to find the receipt area.
 */
export function detectEdges(canvas: HTMLCanvasElement, threshold = 30): { x: number; y: number; width: number; height: number } {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;

    let minX = width, minY = height, maxX = 0, maxY = 0;

    // Scan pixels to find non-background content
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];

            // Check if pixel is "content" (not near-white background)
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            if (brightness < 255 - threshold) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
    }

    // Add padding
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    // Fallback to full image if detection failed
    if (maxX <= minX || maxY <= minY) {
        return { x: 0, y: 0, width, height };
    }

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Crop canvas to the detected document area.
 */
export function autoCrop(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const bounds = detectEdges(canvas);
    const cropped = document.createElement('canvas');
    cropped.width = bounds.width;
    cropped.height = bounds.height;

    const ctx = cropped.getContext('2d')!;
    ctx.drawImage(canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);

    return cropped;
}

/**
 * Convert image to grayscale using luminance weighting.
 */
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

/**
 * Stretch contrast to use the full 0-255 range.
 */
export function contrastStretch(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 4) {
        const v = data[i];
        if (v < min) min = v;
        if (v > max) max = v;
    }

    const range = max - min || 1;
    for (let i = 0; i < data.length; i += 4) {
        const normalized = ((data[i] - min) / range) * 255;
        data[i] = data[i + 1] = data[i + 2] = Math.round(normalized);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Apply adaptive thresholding for clean black text on white background.
 * Uses a local window to determine threshold per pixel.
 */
export function adaptiveThreshold(canvas: HTMLCanvasElement, windowSize = 15, offset = 10): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data);

    const half = Math.floor(windowSize / 2);

    // Build integral image for fast local average
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
            const x1 = x - half, y1 = y - half;
            const x2 = x + half, y2 = y + half;
            const count = (Math.min(x2, width - 1) - Math.max(x1, 0) + 1) * (Math.min(y2, height - 1) - Math.max(y1, 0) + 1);
            const avg = getAreaSum(x1, y1, x2, y2) / count;

            const i = (y * width + x) * 4;
            const val = data[i] > avg - offset ? 255 : 0;
            output[i] = output[i + 1] = output[i + 2] = val;
            output[i + 3] = 255;
        }
    }

    const outData = new ImageData(output, width, height);
    ctx.putImageData(outData, 0, 0);
    return canvas;
}

/**
 * Apply sharpening convolution kernel.
 */
export function sharpen(canvas: HTMLCanvasElement, amount = 1): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data);

    // Sharpen kernel: [0,-1,0,-1,5,-1,0,-1,0] weighted by amount
    const center = 1 + 4 * amount;
    const side = -amount;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                const idx = (y * width + x) * 4 + c;
                const val =
                    data[idx] * center +
                    data[((y - 1) * width + x) * 4 + c] * side +
                    data[((y + 1) * width + x) * 4 + c] * side +
                    data[(y * width + (x - 1)) * 4 + c] * side +
                    data[(y * width + (x + 1)) * 4 + c] * side;
                output[idx] = Math.max(0, Math.min(255, Math.round(val)));
            }
        }
    }

    ctx.putImageData(new ImageData(output, width, height), 0, 0);
    return canvas;
}

/**
 * Adjust brightness and contrast.
 * brightness: -100 to 100, contrast: -100 to 100
 */
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

/**
 * Rotate canvas by specified degrees (90, 180, 270).
 */
export function rotateImage(canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
    const rotated = document.createElement('canvas');
    const ctx = rotated.getContext('2d')!;

    const rad = (degrees * Math.PI) / 180;
    const isVerticalFlip = degrees === 90 || degrees === 270;

    rotated.width = isVerticalFlip ? canvas.height : canvas.width;
    rotated.height = isVerticalFlip ? canvas.width : canvas.height;

    ctx.translate(rotated.width / 2, rotated.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    return rotated;
}

/**
 * Full receipt enhancement pipeline.
 * Produces a clean, scanner-like output.
 */
export function enhanceReceipt(canvas: HTMLCanvasElement, options: {
    crop?: boolean;
    threshold?: boolean;
    sharpenAmount?: number;
} = {}): HTMLCanvasElement {
    const { crop = true, threshold = true, sharpenAmount = 0.5 } = options;

    // Work on a copy
    let result = document.createElement('canvas');
    result.width = canvas.width;
    result.height = canvas.height;
    result.getContext('2d')!.drawImage(canvas, 0, 0);

    // 1. Auto-crop to document edges
    if (crop) {
        result = autoCrop(result);
    }

    // 2. Convert to grayscale
    result = grayscale(result);

    // 3. Stretch contrast
    result = contrastStretch(result);

    // 4. Apply adaptive threshold for clean text
    if (threshold) {
        result = adaptiveThreshold(result, 15, 12);
    }

    // 5. Sharpen
    if (sharpenAmount > 0) {
        result = sharpen(result, sharpenAmount);
    }

    return result;
}

/**
 * Convert canvas to a Blob for upload.
 */
export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
            type,
            quality
        );
    });
}

/**
 * Convert canvas to data URL string.
 */
export function canvasToDataUrl(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): string {
    return canvas.toDataURL(type, quality);
}

/**
 * Download a canvas as a file.
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, type = 'image/jpeg', quality = 0.92): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(type, quality);
    link.click();
}

/**
 * Download from a URL (for server-hosted images).
 */
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
