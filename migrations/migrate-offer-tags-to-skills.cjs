import sequelize from '../src/database/database.js';
import { Offer } from '../src/models/offer.js';
import { Skill } from '../src/models/skill.js';
import '../src/models/relations.js';

/**
 * Script para migrar datos del campo 'tag' de ofertas a la relación many-to-many con Skills
 * 
 * PRECAUCIÓN: Este script modifica datos. Crear backup antes de ejecutar.
 * 
 * Proceso:
 * 1. Lee todas las ofertas con campo 'tag'
 * 2. Extrae las skills/tags únicos
 * 3. Crea skills faltantes en la tabla skills
 * 4. Establece relaciones many-to-many entre ofertas y skills
 * 5. Reporta resultados
 */

async function migrateOfferTagsToSkills() {
    const transaction = await sequelize.transaction();
    
    try {
        console.log('🚀 Iniciando migración de tags de ofertas a skills...');
        
        // 1. Obtener todas las ofertas con tags
        const offers = await Offer.findAll({
            where: {
                tag: {
                    [sequelize.Sequelize.Op.not]: null,
                    [sequelize.Sequelize.Op.ne]: ''
                }
            },
            transaction
        });
        
        console.log(`📊 Encontradas ${offers.length} ofertas con tags`);
        
        if (offers.length === 0) {
            console.log('✅ No hay ofertas con tags para migrar');
            await transaction.commit();
            return;
        }
        
        // 2. Extraer todos los tags únicos
        const allTags = new Set();
        const offerTagsMap = new Map();
        
        offers.forEach(offer => {
            if (offer.tag) {
                const tags = offer.tag.split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);
                
                offerTagsMap.set(offer.id, tags);
                tags.forEach(tag => allTags.add(tag));
            }
        });
        
        console.log(`🏷️ Encontrados ${allTags.size} tags únicos:`);
        Array.from(allTags).forEach(tag => console.log(`   - ${tag}`));
        
        // 3. Verificar skills existentes y crear las faltantes
        const existingSkills = await Skill.findAll({
            where: {
                name: {
                    [sequelize.Sequelize.Op.in]: Array.from(allTags)
                }
            },
            transaction
        });
        
        const existingSkillNames = new Set(existingSkills.map(skill => skill.name));
        const missingSkills = Array.from(allTags).filter(tag => !existingSkillNames.has(tag));
        
        console.log(`📋 Skills existentes: ${existingSkills.length}`);
        console.log(`➕ Skills a crear: ${missingSkills.length}`);
        
        // Crear skills faltantes
        const newSkills = [];
        for (const skillName of missingSkills) {
            const skill = await Skill.create({
                name: skillName,
                category: 'General', // Categoría por defecto para skills migrados
                description: `Skill migrada automáticamente desde tags de ofertas: ${skillName}`,
                demandLevel: 'medium',
                isActive: true
            }, { transaction });
            
            newSkills.push(skill);
            console.log(`   ✅ Creada skill: ${skillName}`);
        }
        
        // 4. Obtener todas las skills (existentes + nuevas)
        const allSkills = [...existingSkills, ...newSkills];
        const skillsByName = new Map();
        allSkills.forEach(skill => skillsByName.set(skill.name, skill));
        
        // 5. Crear relaciones offer-skill
        let relationsCreated = 0;
        let offersProcessed = 0;
        
        for (const [offerId, tagNames] of offerTagsMap) {
            const offer = await Offer.findByPk(offerId, { transaction });
            if (!offer) continue;
            
            // Obtener skills correspondientes a los tags
            const skillsToAssociate = tagNames
                .map(tagName => skillsByName.get(tagName))
                .filter(skill => skill !== undefined);
            
            if (skillsToAssociate.length > 0) {
                // Verificar si ya existen relaciones (para evitar duplicados)
                const existingAssociations = await offer.getSkills({ transaction });
                const existingSkillIds = new Set(existingAssociations.map(s => s.id));
                
                const skillsToAdd = skillsToAssociate.filter(skill => 
                    !existingSkillIds.has(skill.id)
                );
                
                if (skillsToAdd.length > 0) {
                    await offer.addSkills(skillsToAdd, { transaction });
                    relationsCreated += skillsToAdd.length;
                    console.log(`   🔗 Oferta "${offer.name}": ${skillsToAdd.length} skills asociadas`);
                }
            }
            
            offersProcessed++;
            
            // Progress indicator
            if (offersProcessed % 10 === 0) {
                console.log(`📈 Progreso: ${offersProcessed}/${offers.length} ofertas procesadas`);
            }
        }
        
        // 6. Commit transaction
        await transaction.commit();
        
        // 7. Reportar resultados
        console.log('\n🎉 Migración completada exitosamente!');
        console.log('📊 Resumen:');
        console.log(`   - Ofertas procesadas: ${offersProcessed}`);
        console.log(`   - Skills existentes utilizadas: ${existingSkills.length}`);
        console.log(`   - Skills nuevas creadas: ${newSkills.length}`);
        console.log(`   - Relaciones offer-skill creadas: ${relationsCreated}`);
        
        console.log('\n⚠️ IMPORTANTE:');
        console.log('   - El campo "tag" en ofertas NO ha sido eliminado');
        console.log('   - Verifique manualmente las relaciones antes de eliminar el campo "tag"');
        console.log('   - Use el script verify-migration.js para validar los datos');
        
        return {
            offersProcessed,
            existingSkillsUsed: existingSkills.length,
            newSkillsCreated: newSkills.length,
            relationsCreated
        };
        
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error durante la migración:', error);
        throw error;
    }
}

// Función para verificar la migración
async function verifyMigration() {
    try {
        console.log('\n🔍 Verificando migración...');
        
        // Contar ofertas con tags
        const offersWithTags = await Offer.count({
            where: {
                tag: {
                    [sequelize.Sequelize.Op.not]: null,
                    [sequelize.Sequelize.Op.ne]: ''
                }
            }
        });
        
        // Contar relaciones offer-skill
        const offerSkillRelations = await sequelize.query(
            'SELECT COUNT(*) as count FROM "OfferSkill"',
            { type: sequelize.QueryTypes.SELECT }
        );
        
        console.log(`📊 Ofertas con tags: ${offersWithTags}`);
        console.log(`🔗 Relaciones offer-skill: ${offerSkillRelations[0].count}`);
        
        // Obtener algunas ofertas de ejemplo con sus skills
        const sampleOffers = await Offer.findAll({
            limit: 3,
            include: [{
                model: Skill,
                as: 'skills',
                through: { attributes: [] }
            }]
        });
        
        console.log('\n📋 Ejemplo de ofertas con skills:');
        sampleOffers.forEach(offer => {
            console.log(`   "${offer.name}": ${offer.skills?.length || 0} skills`);
            if (offer.skills && offer.skills.length > 0) {
                offer.skills.forEach(skill => {
                    console.log(`      - ${skill.name}`);
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Error al verificar migración:', error);
    }
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('📡 Conexión a base de datos establecida');
        
        const results = await migrateOfferTagsToSkills();
        await verifyMigration();
        
        console.log('\n✅ Proceso completado');
        
    } catch (error) {
        console.error('💥 Error en el proceso de migración:', error);
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

export { migrateOfferTagsToSkills, verifyMigration };