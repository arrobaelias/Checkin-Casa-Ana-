import { DniData } from '../types';

const MRZ_WEIGHTS = [7, 3, 1];

function calculateCheckDigit(data: string): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        let value: number;

        if (char >= '0' && char <= '9') {
            value = parseInt(char);
        } else if (char >= 'A' && char <= 'Z') {
            value = char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        } else if (char === '<') {
            value = 0;
        } else {
            value = 0;
        }

        sum += value * MRZ_WEIGHTS[i % 3];
    }

    return sum % 10;
}

export function validateMrzData(dniData: DniData): Record<keyof DniData, boolean> {
    const results: Record<string, boolean> = {};

    Object.keys(dniData).forEach(key => {
        results[key] = true;
    });

    try {
        const numeroSoporte = dniData.numeroSoporte?.valor || '';
        const digitoControlNumero = dniData.digitoControlNumero?.valor || '';
        if (numeroSoporte && digitoControlNumero) {
            const calculatedCheck = calculateCheckDigit(numeroSoporte);
            results.numeroSoporte = calculatedCheck === parseInt(digitoControlNumero);
            results.digitoControlNumero = results.numeroSoporte;
        }

        const fechaNac = dniData.fechaNacimiento?.valor || '';
        const digitoControlFechaNac = dniData.digitoControlFechaNac?.valor || '';
        if (fechaNac.length === 10 && digitoControlFechaNac) {
            const parts = fechaNac.split('-');
            const mrzDate = parts[0].substring(2) + parts[1] + parts[2];
            const calculatedCheck = calculateCheckDigit(mrzDate);
            results.fechaNacimiento = calculatedCheck === parseInt(digitoControlFechaNac);
            results.digitoControlFechaNac = results.fechaNacimiento;
        }

        const fechaCad = dniData.fechaCaducidad?.valor || '';
        const digitoControlCaducidad = dniData.digitoControlCaducidad?.valor || '';
        if (fechaCad.length === 10 && digitoControlCaducidad) {
            const parts = fechaCad.split('-');
            const mrzDate = parts[0].substring(2) + parts[1] + parts[2];
            const calculatedCheck = calculateCheckDigit(mrzDate);
            results.fechaCaducidad = calculatedCheck === parseInt(digitoControlCaducidad);
            results.digitoControlCaducidad = results.fechaCaducidad;
        }

    } catch (error) {
        console.error('Error validando MRZ:', error);
    }

    return results as Record<keyof DniData, boolean>;
}
