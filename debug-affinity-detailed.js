import affinityCalculator from './src/services/affinityCalculator.js';

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

console.log('=== DEBUGGING AFFINITY CALCULATION ===');
console.log('Student skills:', Object.keys(studentSkills).length, 'skills');
console.log('Offer skills:', Object.keys(offerSkills).length, 'skills');
console.log('Profamily data:', profamilyData);

// Paso 1: Calcular profamily affinity
const profamilyAffinity = affinityCalculator._calculateProfamilyAffinity(
  profamilyData.profamilyId,
  profamilyData.offerProfamilyIds,
  false
);
console.log('Profamily affinity:', profamilyAffinity);

// Paso 2: Verificar que los objetos se pasan correctamente
console.log('Calling calculateAffinity with:');
console.log('- offerSkills keys:', Object.keys(offerSkills));
console.log('- studentSkills keys:', Object.keys(studentSkills));
console.log('- options:', profamilyData);

try {
  const result = affinityCalculator.calculateAffinity(offerSkills, studentSkills, profamilyData);
  console.log('Final result:', result);
} catch (error) {
  console.error('Error in calculateAffinity:', error);
  console.error('Stack:', error.stack);
}

process.exit(0);