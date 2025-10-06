import { Scenter, Profamily } from '../models/relations.js';
import logger from '../logs/logger.js';

// Función para calcular similitud de strings (simple)
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

// Distancia de Levenshtein
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

export async function validateScenter(req, res) {
    const { scenterName } = req.body;

    try {
        if (!scenterName || typeof scenterName !== 'string') {
            return res.status(400).json({
                isValid: false,
                notes: 'Nombre de centro de estudios requerido'
            });
        }

        const trimmedName = scenterName.trim();

        // Buscar scenters activos existentes
        const existingScenters = await Scenter.findAll({
            where: { active: true },
            attributes: ['id', 'name', 'code', 'city']
        });

        // Buscar coincidencias exactas
        const exactMatch = existingScenters.find(s =>
            s.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (exactMatch) {
            return res.json({
                isValid: true,
                notes: 'Centro de estudios afiliado encontrado',
                correctedName: exactMatch.name,
                scenterId: exactMatch.id,
                scenter: exactMatch
            });
        }

        // Buscar similitudes
        const similarities = existingScenters.map(s => ({
            id: s.id,
            name: s.name,
            code: s.code,
            city: s.city,
            similarity: calculateSimilarity(trimmedName.toLowerCase(), s.name.toLowerCase())
        })).filter(item => item.similarity > 0.7) // Umbral más alto para scenters
          .sort((a, b) => b.similarity - a.similarity);

        if (similarities.length > 0) {
            const bestMatch = similarities[0];
            return res.json({
                isValid: true,
                notes: `¿Quisiste decir "${bestMatch.name}"?`,
                correctedName: bestMatch.name,
                scenterId: bestMatch.id,
                scenter: bestMatch,
                alternatives: similarities.slice(1, 3)
            });
        }

        // Si no hay coincidencias, informar que no está afiliado
        return res.json({
            isValid: false,
            notes: 'Centro de estudios no afiliado a la plataforma. Solo puedes seleccionar centros afiliados.',
            suggestion: 'Contacta con el centro para que se afilie a la plataforma'
        });

    } catch (error) {
        logger.error('Error validating scenter:', error);
        res.status(500).json({
            isValid: false,
            notes: 'Error interno del servidor al validar centro de estudios'
        });
    }
}

export async function validateProfamily(req, res) {
    const { profamilyName } = req.body;

    try {
        if (!profamilyName || typeof profamilyName !== 'string') {
            return res.status(400).json({
                isValid: false,
                notes: 'Nombre de familia profesional requerido'
            });
        }

        const trimmedName = profamilyName.trim();

        // Buscar todas las profamilys existentes
        const existingProfamilies = await Profamily.findAll();

        // Buscar coincidencias exactas
        const exactMatch = existingProfamilies.find(p =>
            p.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (exactMatch) {
            return res.json({
                isValid: true,
                notes: 'Familia profesional existente',
                correctedName: exactMatch.name,
                profamilyId: exactMatch.id
            });
        }

        // Buscar similitudes
        const similarities = existingProfamilies.map(p => ({
            id: p.id,
            name: p.name,
            similarity: calculateSimilarity(trimmedName.toLowerCase(), p.name.toLowerCase())
        })).filter(item => item.similarity > 0.6)
          .sort((a, b) => b.similarity - a.similarity);

        if (similarities.length > 0) {
            const bestMatch = similarities[0];
            return res.json({
                isValid: true,
                notes: `¿Quisiste decir "${bestMatch.name}"?`,
                correctedName: bestMatch.name,
                profamilyId: bestMatch.id,
                alternatives: similarities.slice(1, 3).map(s => ({ id: s.id, name: s.name }))
            });
        }

        // Si no hay coincidencias pero el nombre parece válido
        const profamilyKeywords = ['desarrollo', 'ingeniería', 'técnico', 'administración', 'comercio', 'salud', 'educación', 'construcción', 'manufactura', 'transporte', 'informática', 'telecomunicaciones', 'energía', 'medio ambiente', 'turismo', 'hostelería', 'artes', 'diseño', 'marketing', 'ventas', 'finanzas', 'contabilidad', 'recursos humanos', 'logística', 'mantenimiento', 'seguridad', 'calidad'];

        const hasProfamilyKeyword = profamilyKeywords.some(keyword =>
            trimmedName.toLowerCase().includes(keyword)
        );

        if (hasProfamilyKeyword && trimmedName.length > 5) {
            return res.json({
                isValid: true,
                notes: 'Nueva familia profesional parece válida'
            });
        }

        return res.json({
            isValid: false,
            notes: 'El nombre no parece corresponder a una familia profesional válida'
        });

    } catch (error) {
        logger.error('Error validating profamily:', error);
        res.status(500).json({
            isValid: false,
            notes: 'Error interno del servidor al validar familia profesional'
        });
    }
}