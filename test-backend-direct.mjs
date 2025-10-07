// 🔥 SCRIPT PARA PROBAR BÚSQUEDA INTELIGENTE DIRECTAMENTE EN BACKEND
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testBackendDirectly() {
  console.log('🧪 ===== TEST DIRECTO AL BACKEND =====');

  try {
    // 🔥 LOGIN
    console.log('🔐 Iniciando sesión...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rrhh@consultoriabcn.es',
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login exitoso');

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
        console.log(`   ${i+1}. ${s.User.name} - Afinidad: ${s.affinity.level} (${s.affinity.score})`);
      });
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
        console.log(`   ${i+1}. ${s.User.name} - Afinidad: ${s.affinity.level} (${s.affinity.score}) - Profamily: ${s.Profamily?.name || 'NINGUNO'}`);
      });
    } else {
      console.log(`❌ Test 2 falló: ${test2Response.status}`);
    }

    // 🔥 TEST 3: CON FILTRO DE PROFAMILY ID 1 Y VERIFICAR LOGS
    console.log('\n📋 TEST 3: Verificar que el filtro se está aplicando correctamente');
    console.log('🔍 Revisa los logs del backend para ver si filters.profamilyId llega correctamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBackendDirectly();