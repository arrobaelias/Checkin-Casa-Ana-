import React, { useRef } from 'react';
import { Camera, Upload, AlertCircle } from 'lucide-react';

interface DniScannerProps {
    onScan: (file: File) => void;
    isLoading: boolean;
    error: string | null;
}

const DniScanner: React.FC<DniScannerProps> = ({ onScan, isLoading, error }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onScan(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-stone-800 mb-2">Escanea tu DNI</h2>
                <p className="text-stone-600">Captura la imagen del reverso de tu DNI para comenzar el check-in</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={handleCameraClick}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center gap-3 p-8 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 hover:border-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Camera className="w-12 h-12 text-emerald-700" />
                    <span className="font-semibold text-emerald-900">Usar Cámara</span>
                </button>

                <button
                    onClick={handleUploadClick}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center gap-3 p-8 bg-stone-50 border-2 border-stone-200 rounded-xl hover:bg-stone-100 hover:border-stone-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Upload className="w-12 h-12 text-stone-700" />
                    <span className="font-semibold text-stone-900">Subir Imagen</span>
                </button>
            </div>

            {isLoading && (
                <div className="text-center py-8">
                    <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-stone-600 font-medium">Procesando imagen del DNI...</p>
                </div>
            )}

            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default DniScanner;
