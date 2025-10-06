const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ausbildung', 'postgres', 'D3v3/op3R', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: console.log
});

// Skills mapping por estudiante basado en su perfil
const studentSkillsMapping = {
    'sofia_perez': {
        email: 'sofia.perez@email.com',
        skills: [
            { name: 'Comunicación', level: 'expert' },
            { name: 'Inglés', level: 'expert' },
            { name: 'Alemán', level: 'advanced' },
            { name: 'Marketing digital', level: 'advanced' },
            { name: 'Social Media', level: 'advanced' },
            { name: 'Branding', level: 'intermediate' },
            { name: 'Creatividad', level: 'advanced' }
        ]
    },
    'javier_moreno': {
        email: 'javier.moreno@email.com',
        skills: [
            { name: 'Programación', level: 'advanced' },
            { name: 'JavaScript', level: 'advanced' },
            { name: 'Node.js', level: 'advanced' },
            { name: 'React', level: 'intermediate' },
            { name: 'HTML/CSS', level: 'advanced' },
            { name: 'Bases de datos SQL', level: 'intermediate' },
            { name: 'Control de versiones (Git)', level: 'intermediate' }
        ]
    },
    'maria_garcia': {
        email: 'maria.garcia@email.com',
        skills: [
            { name: 'Matemáticas', level: 'advanced' },
            { name: 'Estadística', level: 'intermediate' },
            { name: 'Investigación', level: 'advanced' },
            { name: 'Análisis de datos', level: 'intermediate' },
            { name: 'Pensamiento crítico', level: 'advanced' },
            { name: 'Comunicación', level: 'advanced' }
        ]
    },
    'carlos_rodriguez': {
        email: 'carlos.rodriguez@email.com',
        skills: [
            { name: 'Programación', level: 'intermediate' },
            { name: 'Resolución de problemas', level: 'advanced' },
            { name: 'Trabajo en equipo', level: 'advanced' }
        ]
    },
    'ana_martinez': {
        email: 'ana.martinez@email.com',
        skills: [
            { name: 'Comunicación', level: 'advanced' },
            { name: 'Inglés', level: 'intermediate' },
            { name: 'Pensamiento crítico', level: 'advanced' },
            { name: 'Creatividad', level: 'advanced' },
            { name: 'Empatía', level: 'advanced' }
        ]
    },
    'david_lopez': {
        email: 'david.lopez@email.com',
        skills: [
            { name: 'Comunicación', level: 'intermediate' },
            { name: 'Trabajo en equipo', level: 'intermediate' },
            { name: 'Resolución de problemas', level: 'intermediate' }
        ]
    },
    'laura_gonzalez': {
        email: 'laura.gonzalez@email.com',
        skills: [
            { name: 'Comunicación', level: 'beginner' },
            { name: 'Trabajo en equipo', level: 'beginner' }
        ]
    }
};

async function assignSkillsToStudents() {
    console.log('🎯 Asignando skills a estudiantes de prueba...\n');

    try {
        for (const [username, studentData] of Object.entries(studentSkillsMapping)) {
            console.log(`👤 Procesando estudiante: ${username} (${studentData.email})`);

            // Obtener el studentId del estudiante (no userId)
            const [studentResult] = await sequelize.query(`
                SELECT s.id as studentId FROM "students" s
                INNER JOIN "users" u ON s."userId" = u.id
                WHERE u.email = '${studentData.email}'
            `);

            if (studentResult.length === 0) {
                console.log(`   ❌ Estudiante no encontrado: ${studentData.email}`);
                continue;
            }

            const studentId = studentResult[0].studentid;
            console.log(`   ✅ Estudiante encontrado, ID: ${studentId}`);

            // Asignar cada skill al estudiante
            for (const skillData of studentData.skills) {
                // Buscar el skill por nombre
                const [skillResult] = await sequelize.query(`
                    SELECT id FROM "skills" WHERE name = '${skillData.name}'
                `);

                if (skillResult.length === 0) {
                    console.log(`   ⚠️  Skill no encontrado: ${skillData.name}`);
                    continue;
                }

                const skillId = skillResult[0].id;

                // Verificar si ya existe la relación
                const [existingRelation] = await sequelize.query(`
                    SELECT * FROM "student_skills"
                    WHERE "studentId" = ${studentId} AND "skillId" = ${skillId}
                `);

                if (existingRelation.length > 0) {
                    console.log(`   ⏭️  Ya existe relación: ${skillData.name} (nivel ${skillData.level})`);
                    continue;
                }

                // Crear la relación student_skills
                await sequelize.query(`
                    INSERT INTO "student_skills" ("studentId", "skillId", "proficiencyLevel", "createdAt", "updatedAt")
                    VALUES (${studentId}, ${skillId}, '${skillData.level}', NOW(), NOW())
                `);

                console.log(`   ✅ Asignado: ${skillData.name} (nivel ${skillData.level})`);
            }

            console.log(`   📊 Skills asignados a ${username}: ${studentData.skills.length}\n`);
        }

        // Verificar resultados finales
        console.log('📈 RESUMEN FINAL:');
        for (const [username, studentData] of Object.entries(studentSkillsMapping)) {
            const [studentResult] = await sequelize.query(`
                SELECT s.id as studentId FROM "students" s
                INNER JOIN "users" u ON s."userId" = u.id
                WHERE u.email = '${studentData.email}'
            `);

            if (studentResult.length > 0) {
                const studentId = studentResult[0].studentid;
                const [countResult] = await sequelize.query(`
                    SELECT COUNT(*) as count FROM "student_skills" WHERE "studentId" = ${studentId}
                `);
                console.log(`   ${username}: ${countResult[0].count} skills`);
            }
        }

        await sequelize.close();
        console.log('\n✅ Proceso completado exitosamente');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

assignSkillsToStudents();