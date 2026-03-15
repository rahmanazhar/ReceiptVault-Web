/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
    glob(pattern: string, options?: { eager?: boolean }): Record<string, unknown>;
}

// OpenCV.js global (loaded via CDN in app.blade.php)
declare const cv: any;

// jscanify global (loaded via script in app.blade.php)
declare class jscanify {
    findPaperContour(mat: any): any | null;
    getCornerPoints(contour: any): {
        topLeftCorner: { x: number; y: number } | undefined;
        topRightCorner: { x: number; y: number } | undefined;
        bottomLeftCorner: { x: number; y: number } | undefined;
        bottomRightCorner: { x: number; y: number } | undefined;
    };
    extractPaper(image: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement, width: number, height: number, cornerPoints?: any): HTMLCanvasElement | null;
    highlightPaper(image: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement): HTMLCanvasElement;
}
