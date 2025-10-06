import { Offer, Skill } from './src/models/relations.js';

async function debugOfferSkills() {
  try {
    const offer = await Offer.findByPk(1, {
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] }
        }
      ]
    });

    console.log('Offer found:', !!offer);
    if (offer) {
      console.log('Offer ID:', offer.id);
      console.log('Offer name:', offer.name);
      console.log('Skills count:', offer.skills ? offer.skills.length : 0);
      console.log('Skills data:', offer.skills ? offer.skills.map(s => ({ id: s.id, name: s.name })) : []);

      // Convertir como en el controller
      const offerSkills = {};
      if (offer.skills && offer.skills.length > 0) {
        offer.skills.forEach(skill => {
          offerSkills[skill.name.toLowerCase()] = 2; // Nivel por defecto
        });
      }
      console.log('Converted offerSkills:', offerSkills);
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

debugOfferSkills();