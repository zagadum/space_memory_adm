/**
 * Validates Polish IBAN using Mod 97 logic (ISO 13616).
 * Expected format: PL XX XXXX XXXX XXXX XXXX XXXX XXXX (28 characters total)
 */
export function validateIBAN(iban: string): boolean {
    // Remove all spaces and convert to uppercase
    const cleanIBAN = iban.replace(/\s+/g, '').toUpperCase();

    // Polish IBAN must be exactly 28 characters and start with 'PL'
    if (cleanIBAN.length !== 28 || !cleanIBAN.startsWith('PL')) {
        return false;
    }

    // IBAN Validation logic:
    // 1. Move first 4 characters to the end: PLXX -> XXPL
    // 2. Replace letters with numbers (A=10, B=11, ..., Z=35)
    // 3. Perform Modulo 97 (result should be 1)

    const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);

    const numeric = rearranged.split('').map(char => {
        const code = char.charCodeAt(0);
        // A-Z are 65-90. We map them to 10-35.
        return code >= 65 && code <= 90 ? (code - 55).toString() : char;
    }).join('');

    // Modulo calculation for large numbers in chunks
    let remainder = 0;
    for (let i = 0; i < numeric.length; i += 7) {
        remainder = parseInt(remainder + numeric.substring(i, i + 7)) % 97;
    }

    return remainder === 1;
}
