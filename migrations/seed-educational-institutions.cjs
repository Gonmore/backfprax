import sequelize from '../src/database/database.js';
import { EducationalInstitution } from '../src/models/relations.js';

/**
 * Script para poblar datos iniciales de instituciones educativas
 * Incluye universidades, institutos y centros educativos comunes
 */

async function seedEducationalInstitutions() {
    try {
        console.log('🚀 Iniciando poblamiento de instituciones educativas...');

        // Datos de instituciones educativas
        const institutionsData = [
            // Universidades en España
            { name: 'Universidad Complutense de Madrid', type: 'university', city: 'Madrid' },
            { name: 'Universidad Politécnica de Madrid', type: 'university', city: 'Madrid' },
            { name: 'Universidad Autónoma de Madrid', type: 'university', city: 'Madrid' },
            { name: 'Universidad de Barcelona', type: 'university', city: 'Barcelona' },
            { name: 'Universidad Politécnica de Catalunya', type: 'university', city: 'Barcelona' },
            { name: 'Universidad de Valencia', type: 'university', city: 'Valencia' },
            { name: 'Universidad de Sevilla', type: 'university', city: 'Sevilla' },
            { name: 'Universidad de Granada', type: 'university', city: 'Granada' },
            { name: 'Universidad de Málaga', type: 'university', city: 'Málaga' },
            { name: 'Universidad de Zaragoza', type: 'university', city: 'Zaragoza' },

            // Universidades en Latinoamérica
            { name: 'Universidad Nacional Autónoma de México', type: 'university', city: 'Ciudad de México' },
            { name: 'Instituto Tecnológico y de Estudios Superiores de Monterrey', type: 'technical_institute', city: 'Monterrey' },
            { name: 'Pontificia Universidad Católica de Chile', type: 'university', city: 'Santiago' },
            { name: 'Universidad de Buenos Aires', type: 'university', city: 'Buenos Aires' },
            { name: 'Universidad de São Paulo', type: 'university', city: 'São Paulo' },
            { name: 'Universidad Nacional de Colombia', type: 'university', city: 'Bogotá' },
            { name: 'Universidad de los Andes', type: 'university', city: 'Bogotá' },
            { name: 'Instituto Tecnológico de Buenos Aires', type: 'technical_institute', city: 'Buenos Aires' },
            { name: 'Universidad Peruana Cayetano Heredia', type: 'university', city: 'Lima' },
            { name: 'Pontificia Universidad Católica del Perú', type: 'university', city: 'Lima' },

            // Institutos tecnológicos y centros de formación
            { name: 'Instituto Nacional de Tecnologías de la Comunicación', type: 'technical_institute', city: 'Madrid' },
            { name: 'Centro de Formación Profesional Estudio', type: 'technical_institute', city: 'Madrid' },
            { name: 'Instituto de Formación Profesional', type: 'technical_institute', city: 'Barcelona' },
            { name: 'Centro de Enseñanza Técnica Industrial', type: 'technical_institute', city: 'Madrid' },
            { name: 'Instituto Tecnológico Superior', type: 'technical_institute', city: 'Guadalajara' },
            { name: 'Centro Educativo Tecnológico', type: 'technical_institute', city: 'México DF' },
            { name: 'Instituto Profesional', type: 'technical_institute', city: 'Santiago' },
            { name: 'Centro de Capacitación Técnica', type: 'technical_institute', city: 'Buenos Aires' },

            // Escuelas técnicas y profesionales
            { name: 'Escuela Técnica Superior de Ingeniería', type: 'high_school', city: 'Madrid' },
            { name: 'Escuela Profesional de Artes y Oficios', type: 'high_school', city: 'Barcelona' },
            { name: 'Colegio Técnico Profesional', type: 'high_school', city: 'San José' },
            { name: 'Escuela Nacional de Comercio', type: 'high_school', city: 'Lima' },
            { name: 'Instituto Educativo Técnico', type: 'high_school', city: 'Bogotá' },

            // Colegios universitarios
            { name: 'Colegio Universitario de Estudios Financieros', type: 'other', city: 'Madrid' },
            { name: 'Colegio Mayor Universitario', type: 'other', city: 'Madrid' },
            { name: 'Instituto Universitario de Investigación', type: 'other', city: 'Barcelona' }
        ];

        console.log(`📚 Creando ${institutionsData.length} instituciones educativas...`);

        // Crear instituciones educativas
        const createdInstitutions = [];
        for (const institutionData of institutionsData) {
            try {
                const institution = await EducationalInstitution.create({
                    name: institutionData.name,
                    type: institutionData.type,
                    city: institutionData.city,
                    active: true
                });

                createdInstitutions.push(institution);
                console.log(`   ✅ ${institutionData.type.toUpperCase()}: ${institutionData.name} (${institutionData.city})`);

            } catch (error) {
                console.log(`   ⚠️  Error creando ${institutionData.name}: ${error.message}`);
            }
        }

        console.log('\n📊 Resumen de datos creados:');
        const totalInstitutions = await EducationalInstitution.count();
        console.log(`   - Total instituciones: ${totalInstitutions}`);

        // Estadísticas por tipo
        const stats = await EducationalInstitution.findAll({
            attributes: [
                'type',
                [sequelize.fn('COUNT', sequelize.col('type')), 'count']
            ],
            group: ['type'],
            raw: true
        });

        console.log('   - Por tipo:');
        stats.forEach(stat => {
            console.log(`     ${stat.type}: ${stat.count}`);
        });

        console.log('\n🔄 Próximos pasos recomendados:');
        console.log('   1. Probar API /api/educational-institutions');
        console.log('   2. Integrar con formularios de educación');
        console.log('   3. Agregar más instituciones según necesidad');

    } catch (error) {
        console.error('❌ Error al poblar instituciones educativas:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');

        await seedEducationalInstitutions();

        console.log('\n🎉 Poblamiento de instituciones educativas completado exitosamente');

    } catch (error) {
        console.error('💥 Error en el poblamiento:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('🔐 Conexión a base de datos cerrada');
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { seedEducationalInstitutions };