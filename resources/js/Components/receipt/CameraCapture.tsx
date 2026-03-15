import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Button from '@/Components/ui/Button';
import { CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
    onCapture: (blob: Blob) => void;
    scanMode?: boolean;
}

export default function CameraCapture({ onCapture, scanMode = false }: Props) {
    const webcamRef = useRef<Webcam>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [captured, setCaptured] = useState<string | null>(null);

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCaptured(imageSrc);
        }
    }, []);

    const handleConfirm = useCallback(() => {
        if (!captured) return;

        // Convert base64 to blob
        fetch(captured)
            .then(res => res.blob())
            .then(blob => onCapture(blob));
    }, [captured, onCapture]);

    const handleRetake = () => {
        setCaptured(null);
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    if (hasPermission === false) {
        return (
            <div className="rounded-xl bg-[var(--color-bg-tertiary)] p-8 text-center">
                <CameraIcon className="h-12 w-12 mx-auto text-[var(--color-text-muted)]" />
                <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                    Camera access denied
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Please allow camera access in your browser settings, or use the upload tab instead.
                </p>
            </div>
        );
    }

    if (captured) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-[var(--color-bg-tertiary)]">
                    <img src={captured} alt="Captured" className="w-full" />
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleConfirm} className="flex-1">
                        Use this photo
                    </Button>
                    <Button variant="secondary" onClick={handleRetake}>
                        Retake
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.85}
                    videoConstraints={{
                        facingMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    }}
                    onUserMedia={() => setHasPermission(true)}
                    onUserMediaError={() => setHasPermission(false)}
                    className="w-full"
                />

                {/* Scan mode overlay */}
                {scanMode && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-8 border-2 border-[var(--color-accent)]/50 rounded-lg">
                            <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-[var(--color-accent)] rounded-tl-lg" />
                            <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-[var(--color-accent)] rounded-tr-lg" />
                            <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-[var(--color-accent)] rounded-bl-lg" />
                            <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-[var(--color-accent)] rounded-br-lg" />
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                                Align document within the frame
                            </span>
                        </div>
                    </div>
                )}

                {/* Camera switch button */}
                <button
                    onClick={toggleCamera}
                    className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                </button>
            </div>

            <Button onClick={handleCapture} className="w-full">
                <CameraIcon className="h-5 w-5 mr-2" />
                {scanMode ? 'Capture Document' : 'Take Photo'}
            </Button>
        </div>
    );
}
