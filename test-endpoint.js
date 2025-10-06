import { getOffersWithAptitude } from './src/controllers/offerController.js';import { getOffersWithAptitude } from './src/controllers/offerController.js';import { getOffersWithAptitude } from './src/controllers/offerController.js';import http from 'http';



// Simular req.user para userId 12 (Sofía)

const mockReq = {

  user: {// Simular req.user para userId 12 (Sofía)

    userId: 12

  }const mockReq = {

};

  user: {// Simular req.user para userId 12 (Sofía)console.log('🧪 Probando endpoint de búsqueda inteligente...\n');

const mockRes = {

  json: (data) => {    userId: 12

    console.log('Response data length:', data.length);

    // Buscar la oferta 1  }const mockReq = {

    const offer1 = data.find(o => o.id === 1);

    if (offer1) {};

      console.log('Oferta 1 - Aptitude:', offer1.aptitude);

      console.log('Oferta 1 - Aptitude Details:', offer1.aptitudeDetails);  user: {const options = {

    } else {

      console.log('Oferta 1 no encontrada en respuesta');const mockRes = {

    }

    return mockRes;  json: (data) => {    userId: 12    hostname: 'localhost',

  },

  status: (code) => {    console.log('Response data length:', data.length);

    console.log('Status code:', code);

    return mockRes;    // Buscar la oferta 1  }    port: 5000,

  }

};    const offer1 = data.find(o => o.id === 1);



async function testEndpoint() {    if (offer1) {};    path: '/api/tokens/search-students',

  try {

    console.log('Testing getOffersWithAptitude for userId 12...');      console.log('Oferta 1 - Aptitude:', offer1.aptitude);

    await getOffersWithAptitude(mockReq, mockRes);

  } catch (error) {      console.log('Oferta 1 - Aptitude Details:', offer1.aptitudeDetails);    method: 'POST',

    console.error('Error:', error);

  }    } else {

}

      console.log('Oferta 1 no encontrada en respuesta');const mockRes = {    headers: {

testEndpoint();
    }

    return mockRes;  json: (data) => {        'Content-Type': 'application/json',

  },

  status: (code) => {    console.log('Response data length:', data.length);        'Authorization': 'Bearer test_token'

    console.log('Status code:', code);

    return mockRes;    // Buscar la oferta 1    }

  }

};    const offer1 = data.find(o => o.id === 1);};



async function testEndpoint() {    if (offer1) {

  try {

    console.log('Testing getOffersWithAptitude for userId 12...');      console.log('Oferta 1 - Aptitude:', offer1.aptitude);const req = http.request(options, (res) => {

    await getOffersWithAptitude(mockReq, mockRes);

  } catch (error) {      console.log('Oferta 1 - Aptitude Details:', offer1.aptitudeDetails);    console.log(`📊 Status: ${res.statusCode}`);

    console.error('Error:', error);

  }    } else {

}

      console.log('Oferta 1 no encontrada en respuesta');    let data = '';

testEndpoint();
    }    res.on('data', (chunk) => {

    return mockRes;        data += chunk;

  },    });

  status: (code) => {

    console.log('Status code:', code);    res.on('end', () => {

    return mockRes;        try {

  }            if (data) {

};                const jsonData = JSON.parse(data);

                console.log('✅ Respuesta exitosa!');

async function testEndpoint() {                console.log('📋 Resultados:', JSON.stringify(jsonData, null, 2));

  try {            } else {

    console.log('Testing getOffersWithAptitude for userId 12...');                console.log('📋 Respuesta vacía');

    await getOffersWithAptitude(mockReq, mockRes);            }

  } catch (error) {        } catch (e) {

    console.error('Error:', error);            console.log('📋 Respuesta (no JSON):', data);

  }        }

}    });

});

testEndpoint();
req.on('error', (e) => {
    console.log('❌ Error de conexión:', e.message);
    console.log('💡 Asegúrate de que el servidor esté corriendo en localhost:5000');
});

req.write(JSON.stringify({
    offerId: 1,
    limit: 5
}));

req.end();