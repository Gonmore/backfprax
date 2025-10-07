// Script de prueba para verificar filtros de profamily en búsqueda inteligente
// Ejecutar con: node test-profamily-filters.mjs

import fetch from 'node-fetch';

const API_URL = 'https://backfprax-production.up.railway.app';
const TEST_TOKEN = 'TU_TOKEN_AQUI'; // Reemplaza con un token válido

async function testProfamilyFilters() {
  console.log('🧪 ===== PRUEBA DE FILTROS PROFAMILY =====');

  try {
    // Paso 1: Login para obtener token
    console.log('🔐 Intentando login...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'practicas@consultoriabcn.es', // Usuario de prueba
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log('✅ Login exitoso, token obtenido');

    // Paso 2: Probar búsqueda con filtro de profamily
    console.log('🔍 Probando búsqueda con filtro profamilyId=1...');

    const searchResponse = await fetch(`${API_URL}/api/students/search-intelligent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: {
          'JavaScript': 3,
          'React': 2
        },
        filters: {
          profamilyId: '1' // Informática y Comunicaciones
        }
      })
    });

    console.log('📡 Respuesta del servidor:', searchResponse.status);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ Error en búsqueda:', errorText);
      return;
    }

    const searchData = await searchResponse.json();
    console.log('✅ Búsqueda exitosa');
    console.log('📊 Estudiantes encontrados:', searchData.students?.length || 0);

    // Analizar resultados
    if (searchData.students && searchData.students.length > 0) {
      console.log('🔍 Analizando afinidad de estudiantes:');
      searchData.students.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.User.name} ${student.User.surname}`);
        console.log(`      Profamily: ${student.Profamily?.name || 'NINGUNO'}`);
        console.log(`      Afinidad: ${student.affinity.level} (score: ${student.affinity.score})`);
        console.log(`      Explicación: ${student.affinity.explanation}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No se encontraron estudiantes');
    }

    // Paso 3: Probar búsqueda sin filtro de profamily
    console.log('🔍 Probando búsqueda SIN filtro profamily...');

    const searchResponse2 = await fetch(`${API_URL}/api/students/search-intelligent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: {
          'JavaScript': 3,
          'React': 2
        },
        filters: {} // Sin filtros
      })
    });

    if (searchResponse2.ok) {
      const searchData2 = await searchResponse2.json();
      console.log('✅ Búsqueda sin filtro exitosa');
      console.log('📊 Estudiantes encontrados:', searchData2.students?.length || 0);

      if (searchData2.students && searchData2.students.length > 0) {
        console.log('🔍 Comparando afinidad (primeros 3 estudiantes):');
        searchData2.students.slice(0, 3).forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.User.name} ${student.User.surname}`);
          console.log(`      Profamily: ${student.Profamily?.name || 'NINGUNO'}`);
          console.log(`      Afinidad: ${student.affinity.level} (score: ${student.affinity.score})`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

// Ejecutar la prueba
testProfamilyFilters();