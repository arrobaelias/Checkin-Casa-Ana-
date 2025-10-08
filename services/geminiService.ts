import { GoogleGenAI } from '@google/genai';
import { DniData, DniField } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('VITE_GEMINI_API_KEY no está configurada. El escaneo de DNI no funcionará.');
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

const EXTRACTION_PROMPT = `Eres un experto en reconocimiento de DNI españoles. Tu tarea es extraer información estructurada de la imagen del DNI.

INSTRUCCIONES CRÍTICAS:
1. Extrae TODOS los datos de la zona MRZ (las dos líneas de texto en la parte inferior del DNI).
2. Extrae los datos legibles del frente del DNI (dirección, localidad, provincia, país, lugar de nacimiento).
3. Devuelve SIEMPRE un objeto JSON válido con TODOS los campos requeridos.
4. Si no puedes leer un campo, establece su valor como cadena vacía "".
5. NO uses null, undefined o valores inventados.

FORMATO DE LA ZONA MRZ:
Línea 1: IDESPNNNNNNNNC<NNNNNNNNNNNNNNC
Línea 2: AAAAAAAAAAAAAAAAAA<<NNNNNNNNNNNNN

Donde:
- ID = Tipo documento
- ESP = Código emisor
- NNNNNNNN = Número de soporte (8 dígitos)
- C = Dígito de control
- AAAA = Apellidos
- NNNN = Nombres
- Fechas en formato AAMMDD

ESTRUCTURA JSON REQUERIDA:
{
  "tipoDocumento": "",
  "codigoEmisor": "",
  "apellidos": "",
  "nombres": "",
  "numeroDocumento": "",
  "numeroSoporte": "",
  "digitoControlNumero": "",
  "nacionalidad": "",
  "fechaNacimiento": "",
  "digitoControlFechaNac": "",
  "sexo": "",
  "fechaCaducidad": "",
  "digitoControlCaducidad": "",
  "datosOpcionales": "",
  "checkFinal": "",
  "direccion": "",
  "localidad": "",
  "provincia": "",
  "pais": "ESPAÑA",
  "lugarNacimiento": ""
}

Responde ÚNICAMENTE con el JSON, sin texto adicional.`;

export async function processDniImage(base64Image: string): Promise<DniData> {
    if (!API_KEY) {
        throw new Error('API Key de Gemini no configurada');
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent([
            EXTRACTION_PROMPT,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
        }

        const extractedData = JSON.parse(jsonMatch[0]);

        const createField = (valor: string, origen: 'mrz' | 'ocr' | 'manual', confianza: number): DniField => ({
            valor: valor || '',
            origen,
            confianza,
            valido: true,
        });

        const dniData: DniData = {
            tipoDocumento: createField(extractedData.tipoDocumento, 'mrz', 0.95),
            codigoEmisor: createField(extractedData.codigoEmisor, 'mrz', 0.95),
            apellidos: createField(extractedData.apellidos, 'mrz', 0.9),
            nombres: createField(extractedData.nombres, 'mrz', 0.9),
            numeroDocumento: createField(extractedData.numeroDocumento, 'ocr', 0.85),
            numeroSoporte: createField(extractedData.numeroSoporte, 'mrz', 0.95),
            digitoControlNumero: createField(extractedData.digitoControlNumero, 'mrz', 0.95),
            nacionalidad: createField(extractedData.nacionalidad, 'mrz', 0.95),
            fechaNacimiento: createField(formatDate(extractedData.fechaNacimiento), 'mrz', 0.95),
            digitoControlFechaNac: createField(extractedData.digitoControlFechaNac, 'mrz', 0.95),
            sexo: createField(extractedData.sexo, 'mrz', 0.95),
            fechaCaducidad: createField(formatDate(extractedData.fechaCaducidad), 'mrz', 0.95),
            digitoControlCaducidad: createField(extractedData.digitoControlCaducidad, 'mrz', 0.95),
            datosOpcionales: createField(extractedData.datosOpcionales, 'mrz', 0.9),
            checkFinal: createField(extractedData.checkFinal, 'mrz', 0.95),
            direccion: createField(extractedData.direccion, 'ocr', 0.75),
            localidad: createField(extractedData.localidad, 'ocr', 0.75),
            provincia: createField(extractedData.provincia, 'ocr', 0.75),
            pais: createField(extractedData.pais || 'ESPAÑA', 'ocr', 0.9),
            lugarNacimiento: createField(extractedData.lugarNacimiento, 'ocr', 0.7),
        };

        return dniData;
    } catch (error) {
        console.error('Error en processDniImage:', error);
        throw new Error('Error al procesar la imagen con Gemini');
    }
}

function formatDate(dateStr: string): string {
    if (!dateStr || dateStr.length !== 6) return dateStr;

    const year = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const day = dateStr.substring(4, 6);

    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;

    return `${fullYear}-${month}-${day}`;
}
