import affinityCalculator from './src/services/affinityCalculator.js';

async function testAffinityCalculation() {
  // Skills de Sofía (del debug anterior)
  const studentSkills = {
    'comunicación': 4,
    'inglés': 4,
    'alemán': 3,
    creatividad: 3,
    branding: 2,
    'marketing digital': 3,
    'social media': 3
  };

  // Skills de la oferta 1 (del debug anterior)
  const offerSkills = {
    aimara: 2,
    'comunicación': 2,
    'trabajo en equipo': 2,
    'inglés': 2,
    'alemán': 2,
    liderazgo: 2,
    creatividad: 2,
    branding: 2,
    'marketing digital': 2,
    'social media': 2
  };

  // Profamily data
  const profamilyData = {
    profamilyId: 33, // Marketing
    offerProfamilyIds: [33] // La oferta también tiene Marketing
  };

  console.log('Student skills:', studentSkills);
  console.log('Offer skills:', offerSkills);
  console.log('Profamily data:', profamilyData);

  try {
    const result = affinityCalculator.calculateAffinity(offerSkills, studentSkills, profamilyData);
    console.log('Affinity result:', result);
  } catch (error) {
    console.error('Error calculating affinity:', error);
  }

  process.exit(0);
}

testAffinityCalculation();