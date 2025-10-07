// 🔥 TEST SCRIPT PARA VERIFICAR QUE LA BÚSQUEDA INTELIGENTE AHORA CONSIDERA PROFAMILYS
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testIntelligentSearchWithProfamily() {
  console.log('🧪 ===== TEST: BÚSQUEDA INTELIGENTE CON PROFAMILY =====');

  try {
    // 🔥 LOGIN PARA OBTENER TOKEN
    console.log('🔐 Iniciando sesión...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'empresa1@test.com',
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso, token obtenido');

    // 🔥 BUSCAR ESTUDIANTE CON PROFAMILY ESPECÍFICO
    console.log('🔍 Buscando estudiante con profamily específico...');

    const searchResponse = await fetch(`${API_BASE}/student/search-intelligent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        skills: {
          'javascript': 2,
          'react': 2,
          'nodejs': 2
        },
        filters: {
          profamilyId: 1  // 🔥 PROFAMILY ID 1 (asumiendo que existe)
        }
      })
    });

    if (!searchResponse.ok) {
      throw new Error(`Búsqueda falló: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('✅ Búsqueda exitosa');
    console.log(`📊 Encontrados ${searchData.students.length} estudiantes`);

    // 🔥 ANALIZAR RESULTADOS
    searchData.students.forEach((student, index) => {
      console.log(`\n👤 ESTUDIANTE ${index + 1}: ${student.User.name} ${student.User.surname}`);
      console.log(`   📈 Afinidad: ${student.affinity.level} (score: ${student.affinity.score})`);
      console.log(`   🎓 Profamily del estudiante: ${student.Profamily?.name || 'NINGUNO'}`);
      console.log(`   🎯 Match profamily: ${student.affinity.profamilyMatch}`);
      console.log(`   💰 Bonus profamily: ${student.affinity.profamilyBonus}%`);
      console.log(`   📝 Explicación: ${student.affinity.explanation}`);
    });

    // 🔥 VERIFICAR QUE LOS ESTUDIANTES CON PROFAMILY MATCHING TIENEN BUENA AFINIDAD
    const studentsWithProfamilyMatch = searchData.students.filter(s =>
      s.affinity.profamilyMatch === 'match' || s.affinity.profamilyBonus > 0
    );

    console.log(`\n🎯 RESULTADO: ${studentsWithProfamilyMatch.length} estudiantes tienen bonus por profamily`);

    if (studentsWithProfamilyMatch.length > 0) {
      console.log('✅ ¡ÉXITO! La búsqueda inteligente ahora considera profamilys en el cálculo de afinidad');
    } else {
      console.log('❌ Aún no funciona - ningún estudiante recibió bonus por profamily');
    }

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
  }
}

// 🔥 EJECUTAR TEST
testIntelligentSearchWithProfamily();