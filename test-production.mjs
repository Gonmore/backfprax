// 🔥 SCRIPT PARA PROBAR EL BACKEND DIRECTAMENTE EN PRODUCCIÓN
import fetch from 'node-fetch';

const API_BASE = 'https://backfprax-production.up.railway.app/api';

async function testProductionBackend() {
  console.log('🧪 ===== TEST PRODUCCIÓN BACKEND =====');

  try {
    // 🔥 LOGIN CON USUARIO DE PRODUCCIÓN
    console.log('🔐 Iniciando sesión en producción...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'practicas@consultoriabcn.es',
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso en producción');

    // 🔥 TEST 1: SIN FILTRO DE PROFAMILY
    console.log('\n📋 TEST 1: Búsqueda sin filtro de profamily');
    const test1Response = await fetch(`${API_BASE}/students/search-intelligent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: {
          'javascript': 2,
          'react': 2
        },
        filters: {}
      })
    });

    if (test1Response.ok) {
      const test1Data = await test1Response.json();
      console.log(`✅ Test 1 exitoso: ${test1Data.students?.length || 0} estudiantes`);
      test1Data.students?.slice(0, 3).forEach((s, i) => {
        console.log(`   ${i+1}. ${s.User.name} ${s.User.surname} - Afinidad: ${s.affinity.level} (${s.affinity.score})`);
      });
    } else {
      console.log(`❌ Test 1 falló: ${test1Response.status}`);
      const errorText = await test1Response.text();
      console.log('Error response:', errorText);
    }

    // 🔥 TEST 2: CON FILTRO DE PROFAMILY ID 1
    console.log('\n📋 TEST 2: Búsqueda CON filtro de profamily ID 1');
    const test2Response = await fetch(`${API_BASE}/students/search-intelligent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: {
          'javascript': 2,
          'react': 2
        },
        filters: {
          profamilyId: 1
        }
      })
    });

    if (test2Response.ok) {
      const test2Data = await test2Response.json();
      console.log(`✅ Test 2 exitoso: ${test2Data.students?.length || 0} estudiantes`);
      test2Data.students?.slice(0, 3).forEach((s, i) => {
        console.log(`   ${i+1}. ${s.User.name} ${s.User.surname} - Afinidad: ${s.affinity.level} (${s.affinity.score}) - Profamily: ${s.Profamily?.name || 'NINGUNO'}`);
        console.log(`      Explicación: ${s.affinity.explanation}`);
      });

      // 🔥 VERIFICAR SI HAY DIFERENCIAS
      const highAffinityStudents = test2Data.students?.filter(s => s.affinity.score > 0.5) || [];
      console.log(`\n🎯 ESTUDIANTES CON AFINIDAD ALTA (>0.5): ${highAffinityStudents.length}`);
      highAffinityStudents.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.User.name} - Score: ${s.affinity.score} - Profamily: ${s.Profamily?.name || 'NINGUNO'}`);
      });

    } else {
      console.log(`❌ Test 2 falló: ${test2Response.status}`);
      const errorText = await test2Response.text();
      console.log('Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProductionBackend();