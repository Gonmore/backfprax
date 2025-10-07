#!/usr/bin/env node

/**
 * Script para ejecutar el seed de la base de datos local
 * Uso: node run-seed.js
 */

import 'dotenv/config';
import seedDatabase from './src/database/seed.js';
import logger from './src/logs/logger.js';

async function runSeed() {
    try {
        console.log('🚀 Ejecutando seed de base de datos local...\n');

        // Force reset for local development to ensure clean state
        const result = await seedDatabase(true);

        console.log('\n✅ Seed completado exitosamente!');
        console.log('📊 Resumen de datos creados:');
        console.log(`   🛠️  Skills: ${result.data.skills}`);
        console.log(`   📚 Familias profesionales: ${result.data.profamilies}`);
        console.log(`   🏫 Centros de estudios: ${result.data.scenters}`);
        console.log(`   🏢 Empresas: ${result.data.companies}`);
        console.log(`   👥 Usuarios totales: ${result.data.users}`);
        console.log(`   🎓 Perfiles estudiantes: ${result.data.students}`);
        console.log(`   � CVs de estudiantes: ${result.data.cvs}`);
        console.log(`   �👨‍🏫 Tutores: ${result.data.tutors}`);
        console.log(`   💼 Ofertas: ${result.data.offers}`);
        console.log(`   📜 Verificaciones académicas: ${result.data.academicVerifications || 0}`);

        console.log('\n🎯 Usuarios de prueba creados:');
        console.log('   📧 Admin: admin@ausbildung.com / admin123');
        console.log('   📧 Empresas: empresa1@test.com / 123456 (y empresa2, empresa3, empresa4)');
        console.log('   📧 Centros: centro1@test.com / 123456 (y centro2, centro3, centro4)');
        console.log('   📧 Estudiantes: estudiante1@test.com / 123456 (y estudiante2-6)');
        console.log('   📧 Tutores: tutor1@test.com / 123456 (y tutor2, tutor3)');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error ejecutando seed:', error.message);
        logger.error('Seed execution failed:', error);
        process.exit(1);
    }
}

runSeed();