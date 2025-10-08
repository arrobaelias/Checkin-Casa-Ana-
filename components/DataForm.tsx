import React, { useState } from 'react';
import { DniData, DniField } from '../types';
import { CheckCircle, AlertCircle, ArrowLeft, Send } from 'lucide-react';

interface DataFormProps {
    initialData: DniData;
    onSubmit: (data: DniData) => void;
    isLoading: boolean;
    onReset: () => void;
}

const DataForm: React.FC<DataFormProps> = ({ initialData, onSubmit, isLoading, onReset }) => {
    const [formData, setFormData] = useState<DniData>(initialData);
    const [consent, setConsent] = useState(false);

    const handleFieldChange = (fieldName: keyof DniData, newValue: string) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                valor: newValue,
                origen: 'manual' as const,
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consent) {
            alert('Debes aceptar el consentimiento para continuar');
            return;
        }
        onSubmit(formData);
    };

    const renderField = (
        label: string,
        fieldName: keyof DniData,
        field: DniField,
        type: string = 'text',
        required: boolean = true
    ) => {
        const isValid = field.valido !== false;
        const confidence = field.confianza;

        return (
            <div className="space-y-1">
                <label className="block text-sm font-semibold text-stone-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <input
                        type={type}
                        value={field.valor}
                        onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                        required={required}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            isValid
                                ? 'border-stone-300 focus:ring-emerald-500'
                                : 'border-red-300 focus:ring-red-500 bg-red-50'
                        }`}
                    />
                    {confidence < 0.8 && (
                        <div className="absolute right-3 top-2.5">
                            <AlertCircle className="w-5 h-5 text-amber-500" title="Confianza baja, verifica el dato" />
                        </div>
                    )}
                    {isValid && confidence >= 0.8 && field.origen !== 'manual' && (
                        <div className="absolute right-3 top-2.5">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                    )}
                </div>
                {!isValid && (
                    <p className="text-xs text-red-600">Este dato falló la validación MRZ. Verifica que sea correcto.</p>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-stone-800 mb-2">Verifica tus datos</h2>
                <p className="text-stone-600 text-sm">Revisa y corrige cualquier dato extraído del DNI</p>
            </div>

            <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="font-bold text-emerald-900 mb-3 text-sm uppercase tracking-wide">Datos Personales</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {renderField('Apellidos', 'apellidos', formData.apellidos)}
                        {renderField('Nombres', 'nombres', formData.nombres)}
                        {renderField('Sexo', 'sexo', formData.sexo)}
                        {renderField('Nacionalidad', 'nacionalidad', formData.nacionalidad)}
                        {renderField('Fecha de Nacimiento', 'fechaNacimiento', formData.fechaNacimiento, 'date')}
                        {renderField('Lugar de Nacimiento', 'lugarNacimiento', formData.lugarNacimiento, 'text', false)}
                    </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                    <h3 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wide">Documento</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderField('Número DNI', 'numeroDocumento', formData.numeroDocumento)}
                        {renderField('Fecha Caducidad', 'fechaCaducidad', formData.fechaCaducidad, 'date')}
                    </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                    <h3 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wide">Dirección</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {renderField('Dirección', 'direccion', formData.direccion)}
                        {renderField('Localidad', 'localidad', formData.localidad)}
                        {renderField('Provincia', 'provincia', formData.provincia)}
                        {renderField('País', 'pais', formData.pais)}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 w-5 h-5 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500"
                        required
                    />
                    <span className="text-sm text-stone-700">
                        Consiento el tratamiento de mis datos personales conforme al Reglamento General de Protección de Datos (RGPD)
                        para el proceso de check-in y registro de huéspedes.
                    </span>
                </label>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onReset}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-stone-200 text-stone-700 rounded-lg font-semibold hover:bg-stone-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !consent}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Enviar Check-in
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default DataForm;
