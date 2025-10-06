import fetch from 'node-fetch';

async function testScenterRegistration() {
    try {
        console.log('🧪 Probando registro de usuario scenter...');

        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testscenter',
                email: 'test@scenter.cl',
                password: 'Test123456',
                role: 'scenter',
                name: 'Test',
                surname: 'Scenter',
                phone: '+56912345678',
                scenterId: 4
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Registro exitoso:', data);
            return { token: data.token, userId: data.user.id };
        } else {
            console.log('❌ Error en registro:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return null;
    }
}

async function createUserScenterAssociation(userId, token) {
    try {
        console.log('🔗 Creando asociación User-Scenter...');

        const response = await fetch('http://localhost:5000/api/user-scenter', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                scenterId: 4,
                isActive: true
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Asociación creada:', data);
            return true;
        } else {
            console.log('❌ Error creando asociación:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return false;
    }
}

async function testScenterLogin() {
    try {
        console.log('🔐 Probando login con usuario scenter...');

        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@scenter.cl',
                password: 'Test123456'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Login exitoso:', data);
            return data.token;
        } else {
            console.log('❌ Error en login:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return null;
    }
}

async function testScenterDashboard(token) {
    try {
        console.log('📊 Probando acceso al dashboard de scenter...');

        const response = await fetch('http://localhost:5000/api/user-scenter/user/1', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Dashboard data:', data);
        } else {
            console.log('❌ Error en dashboard:', data);
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

// Ejecutar pruebas
async function runTests() {
    const result = await testScenterRegistration();
    if (result && result.token) {
        const associationCreated = await createUserScenterAssociation(result.userId, result.token);
        if (associationCreated) {
            const loginToken = await testScenterLogin();
            if (loginToken) {
                await testScenterDashboard(loginToken);
            }
        }
    }
}

runTests();