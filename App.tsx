import React, { useState, useCallback } from 'react';
import { DniData, AppState, DniField, SubmissionResult } from './types';
import { processDniImage } from './services/geminiService';
import { validateMrzData } from './services/mrzParser';
import DniScanner from './components/DniScanner';
import DataForm from './components/DataForm';
import ResultDisplay from './components/ResultDisplay';
import { Camera, RefreshCcw } from 'lucide-react';

// IMPORTANTE: URL de despliegue de tu Google Apps Script.
const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwF70FO7oMP6DVBEEI5EKAC55i_zCm24_xyV45accmR9mvuJRJqfEmIDALjgTKw5DckQQ/exec";

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('SCANNING');
    const [dniData, setDniData] = useState<DniData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

    const handleImageProcess = useCallback(async (imageFile: File) => {
        setIsLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = async () => {
            try {
                const base64Image = (reader.result as string).split(',')[1];
                let extractedData = await processDniImage(base64Image);
                
                const validationResults = validateMrzData(extractedData);
                
                Object.keys(validationResults).forEach(key => {
                    const fieldKey = key as keyof DniData;
                    if (extractedData[fieldKey]) {
                        (extractedData[fieldKey] as DniField).valido = validationResults[fieldKey];
                    }
                });

                setDniData(extractedData);
                setAppState('FORM');
            } catch (err) {
                console.error(err);
                setError('No se pudo procesar la imagen del DNI. Por favor, inténtelo de nuevo o introduzca los datos manualmente.');
                const blankField = (): DniField => ({ valor: '', origen: 'manual', confianza: 1.0, valido: true });
                setDniData({
                    tipoDocumento: blankField(),
                    codigoEmisor: blankField(),
                    apellidos: blankField(),
                    nombres: blankField(),
                    numeroDocumento: blankField(),
                    numeroSoporte: blankField(),
                    digitoControlNumero: blankField(),
                    nacionalidad: blankField(),
                    fechaNacimiento: blankField(),
                    digitoControlFechaNac: blankField(),
                    sexo: blankField(),
                    fechaCaducidad: blankField(),
                    digitoControlCaducidad: blankField(),
                    datosOpcionales: blankField(),
                    checkFinal: blankField(),
                    direccion: blankField(),
                    localidad: blankField(),
                    provincia: blankField(),
                    pais: blankField(),
                    lugarNacimiento: blankField(),
                });
                setAppState('FORM');
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError('Error al leer el archivo de imagen.');
            setIsLoading(false);
        };
    }, []);

    const handleSubmit = useCallback(async (finalData: DniData) => {
        setIsLoading(true);
        setError(null);

        const guestData = {
            apellidos: finalData.apellidos.valor,
            nombres: finalData.nombres.valor,
            sexo: finalData.sexo.valor,
            nacionalidad: finalData.nacionalidad.valor,
            fechaNacimiento: finalData.fechaNacimiento.valor,
            lugarNacimiento: finalData.lugarNacimiento.valor,
            numeroDocumento: finalData.numeroDocumento.valor,
            fechaCaducidad: finalData.fechaCaducidad.valor,
            direccion: finalData.direccion.valor,
            localidad: finalData.localidad.valor,
            provincia: finalData.provincia.valor,
            pais: finalData.pais.valor,
            consentimientoTimestamp: new Date().toISOString(),
        };

        const fullPayloadForDisplay = { ...guestData };
        
        try {
            const formData = new FormData();
            Object.entries(guestData).forEach(([key, value]) => {
                formData.append(key, String(value));
            });

            console.log("Enviando datos a Google Sheets Endpoint:", GOOGLE_SHEET_ENDPOINT);

            const response = await fetch(GOOGLE_SHEET_ENDPOINT, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Error en la respuesta de la red: ${response.status} ${errorText}`);
            }

            setSubmissionResult({ success: true, payload: fullPayloadForDisplay });
            setAppState('RESULT');

        } catch (err) {
            console.error(err);
            const errorMessage = (err instanceof Error) ? err.message : 'Error al enviar los datos. Comprueba la conexión o la configuración del script.';
            setSubmissionResult({ success: false, payload: fullPayloadForDisplay, error: errorMessage });
            setAppState('RESULT');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleReset = () => {
        setAppState('SCANNING');
        setDniData(null);
        setError(null);
        setIsLoading(false);
        setSubmissionResult(null);
    };

    const renderContent = () => {
        switch (appState) {
            case 'SCANNING':
                return <DniScanner onScan={handleImageProcess} isLoading={isLoading} error={error} />;
            case 'FORM':
                if (dniData) {
                    return <DataForm initialData={dniData} onSubmit={handleSubmit} isLoading={isLoading} onReset={handleReset} />;
                }
                return null;
            case 'RESULT':
                 if (submissionResult) {
                    return <ResultDisplay result={submissionResult} onReset={handleReset} />;
                 }
                 return null;
            default:
                return <DniScanner onScan={handleImageProcess} isLoading={isLoading} error={error} />;
        }
    };

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <header className="bg-emerald-800 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Camera className="w-8 h-8"/>
                        <h1 className="text-xl font-bold">Check-in Casa Ana</h1>
                    </div>
                    {appState !== 'SCANNING' && (
                        <button onClick={handleReset} className="p-2 rounded-full hover:bg-emerald-900 transition-colors">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    )}
                </header>
                <main className="p-4 sm:p-6">
                    {renderContent()}
                </main>
            </div>
            <footer className="text-center mt-4 text-xs text-stone-500">
                <p>&copy; {new Date().getFullYear()} Alojamientos Casa Ana</p>
            </footer>
        </div>
    );
};

export default App;