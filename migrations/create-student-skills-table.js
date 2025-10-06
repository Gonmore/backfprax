import sequelize from '../src/database/database.js';
import { StudentSkill } from '../src/models/studentSkill.js';
import '../src/models/relations.js';

/**
 * Script para crear la tabla student_skills
 * Este script debe ejecutarse para migrar el sistema a usar skills en lugar de tags
 */

async function createStudentSkillsTable() {
    try {
        console.log('🚀 Iniciando migración de tabla student_skills...');
        
        // Sincronizar solo la tabla StudentSkill
        await StudentSkill.sync({ force: false });
        
        console.log('✅ Tabla student_skills creada exitosamente');
        console.log('📊 Estructura de la tabla:');
        console.log('   - id (PK, AUTO_INCREMENT)');
        console.log('   - studentId (FK -> students.id)');
        console.log('   - skillId (FK -> skills.id)');
        console.log('   - proficiencyLevel (ENUM: beginner, intermediate, advanced, expert)');
        console.log('   - yearsOfExperience (DECIMAL)');
        console.log('   - isVerified (BOOLEAN)');
        console.log('   - certificationUrl (STRING)');
        console.log('   - notes (TEXT)');
        console.log('   - addedAt (DATE)');
        console.log('   - lastUpdated (DATE)');
        console.log('   - createdAt (DATE)');
        console.log('   - updatedAt (DATE)');
        
        console.log('\n📋 Índices creados:');
        console.log('   - unique_student_skill (studentId, skillId) - UNIQUE');
        console.log('   - idx_proficiency_level (proficiencyLevel)');
        console.log('   - idx_verified_skills (isVerified)');
        
        console.log('\n🔄 Próximos pasos recomendados:');
        console.log('   1. Migrar datos del campo "tag" de students a student_skills');
        console.log('   2. Actualizar ofertas para usar skills en lugar de tags');
        console.log('   3. Probar APIs de skills de estudiantes');
        
    } catch (error) {
        console.error('❌ Error al crear tabla student_skills:', error);
        throw error;
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');
        
        await createStudentSkillsTable();
        
        console.log('\n🎉 Migración completada exitosamente');
        
    } catch (error) {
        console.error('💥 Error en la migración:', error);
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

export { createStudentSkillsTable };