export type AppState = 'SCANNING' | 'FORM' | 'SUBMITTING' | 'RESULT';

export interface DniField {
    valor: string;
    origen: 'mrz' | 'ocr' | 'manual';
    confianza: number;
    valido?: boolean; // Optional flag for MRZ checksum validation
}

export interface DniData {
    // MRZ Fields
    tipoDocumento: DniField;
    codigoEmisor: DniField;
    apellidos: DniField;
    nombres: DniField;
    numeroDocumento: DniField; // Actual DNI number (e.g., 12345678Z)
    numeroSoporte: DniField; // Support number from MRZ line 1
    digitoControlNumero: DniField; // Checksum for numeroSoporte
    nacionalidad: DniField;
    fechaNacimiento: DniField; // YYYY-MM-DD
    digitoControlFechaNac: DniField;
    sexo: DniField;
    fechaCaducidad: DniField; // YYYY-MM-DD
    digitoControlCaducidad: DniField;
    datosOpcionales: DniField;
    checkFinal: DniField;
    
    // OCR Fields
    direccion: DniField;
    localidad: DniField;
    provincia: DniField;
    pais: DniField;
    lugarNacimiento: DniField;
}

export interface SubmissionResult {
    success: boolean;
    payload: object;
    error?: string;
}