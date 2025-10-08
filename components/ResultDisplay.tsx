import React from 'react';
import { SubmissionResult } from '../types';
import { CheckCircle, XCircle, RefreshCcw } from 'lucide-react';

interface ResultDisplayProps {
    result: SubmissionResult;
    onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
    return (
        <div className="space-y-6">
            <div className={`text-center p-8 rounded-2xl ${
                result.success
                    ? 'bg-emerald-50 border-2 border-emerald-200'
                    : 'bg-red-50 border-2 border-red-200'
            }`}>
                <div className="flex justify-center mb-4">
                    {result.success ? (
                        <CheckCircle className="w-20 h-20 text-emerald-600" />
                    ) : (
                        <XCircle className="w-20 h-20 text-red-600" />
                    )}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${
                    result.success ? 'text-emerald-900' : 'text-red-900'
                }`}>
                    {result.success ? 'Check-in Completado' : 'Error en el Check-in'}
                </h2>
                <p className={`text-sm ${
                    result.success ? 'text-emerald-700' : 'text-red-700'
                }`}>
                    {result.success
                        ? 'Tus datos han sido registrados correctamente en Google Sheets'
                        : result.error || 'Hubo un problema al registrar tus datos'
                    }
                </p>
            </div>

            {result.success && (
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
                    <h3 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wide">Datos Enviados</h3>
                    <div className="space-y-2 text-sm">
                        {Object.entries(result.payload).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-stone-200 last:border-0">
                                <span className="font-medium text-stone-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="text-stone-900 font-semibold">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
                <RefreshCcw className="w-5 h-5" />
                Nuevo Check-in
            </button>
        </div>
    );
};

export default ResultDisplay;
