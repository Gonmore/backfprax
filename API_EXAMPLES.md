# Ejemplos de Uso de la API - Ausbildung

Este archivo contiene ejemplos prácticos de todas las llamadas a la API para que el desarrollador del frontend pueda testear rápidamente.

## Configuración Base

```javascript
const API_BASE_URL = 'http://localhost:3000';
const API_TOKEN = 'tu_jwt_token_aqui'; // Obtener después del login

// Headers para peticiones autenticadas
const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
};

// Headers para peticiones públicas
const publicHeaders = {
    'Content-Type': 'application/json'
};
```

## Ejemplos de Autenticación

### Login
```javascript
// POST /auth/login
fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: publicHeaders,
    body: JSON.stringify({
        email: 'usuario@ejemplo.com',
        password: 'contraseña123'
    })
})
.then(response => response.json())
.then(data => {
    if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('Login exitoso');
    }
});
```

### Registro
```javascript
// POST /auth/register
fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: publicHeaders,
    body: JSON.stringify({
        username: 'nuevoUsuario',
        email: 'nuevo@ejemplo.com',
        password: 'contraseña123'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Ejemplos de Ofertas

### Obtener todas las ofertas (público)
```javascript
// GET /api/offers
fetch(`${API_BASE_URL}/api/offers`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(offers => {
    console.log('Ofertas disponibles:', offers);
});
```

### Obtener una oferta específica
```javascript
// GET /api/offers/:id
const offerId = 1;
fetch(`${API_BASE_URL}/api/offers/${offerId}`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(offer => {
    console.log('Oferta:', offer);
});
```

### Crear una nueva oferta (autenticado)
```javascript
// POST /api/offers
fetch(`${API_BASE_URL}/api/offers`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
        name: 'Prácticas en Desarrollo Web',
        location: 'Madrid',
        mode: 'presencial',
        type: 'prácticas',
        period: '3 meses',
        schedule: '9:00-17:00',
        min_hr: 300,
        car: false,
        sector: 'Tecnología',
        tag: 'desarrollo, web, javascript, react',
        description: 'Oportunidad de prácticas en desarrollo web frontend y backend usando tecnologías modernas',
        jobs: 'Desarrollo de aplicaciones web, mantenimiento de código, testing, documentación',
        requisites: 'Conocimientos básicos de HTML, CSS, JavaScript. Deseable experiencia con React',
        profamilyId: 1,
        companyId: 1
    })
})
.then(response => response.json())
.then(offer => {
    console.log('Oferta creada:', offer);
});
```

### Actualizar una oferta (autenticado)
```javascript
// PUT /api/offers/:id
const offerId = 1;
fetch(`${API_BASE_URL}/api/offers/${offerId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
        name: 'Prácticas en Desarrollo Web Full Stack',
        location: 'Madrid',
        mode: 'híbrido',
        type: 'prácticas',
        period: '6 meses',
        schedule: 'flexible',
        min_hr: 400,
        car: false,
        sector: 'Tecnología',
        tag: 'desarrollo, web, javascript, react, node',
        description: 'Prácticas completas en desarrollo full stack',
        jobs: 'Desarrollo frontend y backend, APIs REST, bases de datos',
        requisites: 'Experiencia con JavaScript, React, Node.js',
        profamilyId: 1
    })
})
.then(response => response.json())
.then(result => {
    console.log('Oferta actualizada:', result);
});
```

### Obtener ofertas por empresa
```javascript
// GET /api/offers/company/:companyId
const companyId = 1;
fetch(`${API_BASE_URL}/api/offers/company/${companyId}`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(offers => {
    console.log('Ofertas de la empresa:', offers);
});
```

### Obtener ofertas por familia profesional
```javascript
// GET /api/offers/profamily/:profamilyId
const profamilyId = 1;
fetch(`${API_BASE_URL}/api/offers/profamily/${profamilyId}`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(offers => {
    console.log('Ofertas de la familia profesional:', offers);
});
```

## Ejemplos de Familias Profesionales

### Obtener todas las familias profesionales (público)
```javascript
// GET /api/profamilies
fetch(`${API_BASE_URL}/api/profamilies`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(profamilies => {
    console.log('Familias profesionales:', profamilies);
});
```

### Crear una nueva familia profesional (autenticado)
```javascript
// POST /api/profamilies
fetch(`${API_BASE_URL}/api/profamilies`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
        name: 'Informática y Comunicaciones',
        description: 'Familia profesional que abarca desarrollos informáticos, sistemas de información, telecomunicaciones y redes'
    })
})
.then(response => response.json())
.then(profamily => {
    console.log('Familia profesional creada:', profamily);
});
```

### Obtener estudiantes de una familia profesional
```javascript
// GET /api/profamilies/:id/students
const profamilyId = 1;
fetch(`${API_BASE_URL}/api/profamilies/${profamilyId}/students`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(students => {
    console.log('Estudiantes de la familia profesional:', students);
});
```

### Obtener tutores de una familia profesional
```javascript
// GET /api/profamilies/:id/tutors
const profamilyId = 1;
fetch(`${API_BASE_URL}/api/profamilies/${profamilyId}/tutors`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(tutors => {
    console.log('Tutores de la familia profesional:', tutors);
});
```

## Ejemplos de Tutores

### Obtener todos los tutores (público)
```javascript
// GET /api/tutors
fetch(`${API_BASE_URL}/api/tutors`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(tutors => {
    console.log('Tutores disponibles:', tutors);
});
```

### Crear un nuevo tutor (autenticado)
```javascript
// POST /api/tutors
fetch(`${API_BASE_URL}/api/tutors`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
        id: '12345678A',
        name: 'María García López',
        email: 'maria.garcia@centro.edu',
        grade: 'Doctora',
        degree: 'Ingeniería Informática',
        scenterId: 1,
        profamilyId: 1
    })
})
.then(response => response.json())
.then(tutor => {
    console.log('Tutor creado:', tutor);
});
```

### Obtener tutores por centro de estudios
```javascript
// GET /api/tutors/scenter/:scenterId
const scenterId = 1;
fetch(`${API_BASE_URL}/api/tutors/scenter/${scenterId}`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(tutors => {
    console.log('Tutores del centro:', tutors);
});
```

## Ejemplos de Estudiantes

### Obtener todos los estudiantes (autenticado)
```javascript
// GET /api/student
fetch(`${API_BASE_URL}/api/student`, {
    method: 'GET',
    headers: authHeaders
})
.then(response => response.json())
.then(students => {
    console.log('Estudiantes:', students);
});
```

### Crear un nuevo estudiante (autenticado)
```javascript
// POST /api/student
fetch(`${API_BASE_URL}/api/student`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
        name: 'Ana',
        surname: 'Martínez Ruiz',
        email: 'ana.martinez@estudiante.com',
        phone: '612345678',
        address: 'Calle Falsa 123, Madrid',
        profamilyId: 1
    })
})
.then(response => response.json())
.then(student => {
    console.log('Estudiante creado:', student);
});
```

## Ejemplos de Empresas

### Obtener empresas del usuario (autenticado)
```javascript
// PUT /api/company (método PUT para obtener empresas del usuario)
fetch(`${API_BASE_URL}/api/company`, {
    method: 'PUT',
    headers: authHeaders
})
.then(response => response.json())
.then(companies => {
    console.log('Empresas del usuario:', companies);
});
```

### Crear una nueva empresa (autenticado)
```javascript
// POST /api/company
fetch(`${API_BASE_URL}/api/company`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
        name: 'TechCorp Solutions',
        code: 'TECH001',
        city: 'Madrid',
        address: 'Av. Tecnología 100',
        phone: '915551234',
        email: 'info@techcorp.com',
        sector: 'Tecnología'
    })
})
.then(response => response.json())
.then(company => {
    console.log('Empresa creada:', company);
});
```

## Ejemplos de Centros de Estudio

### Obtener todos los centros (público)
```javascript
// GET /api/scenter
fetch(`${API_BASE_URL}/api/scenter`, {
    method: 'GET',
    headers: publicHeaders
})
.then(response => response.json())
.then(scenters => {
    console.log('Centros de estudio:', scenters);
});
```

### Crear un nuevo centro (autenticado)
```javascript
// POST /api/scenter
fetch(`${API_BASE_URL}/api/scenter`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
        name: 'Instituto Tecnológico Madrid',
        code: 'ITM001',
        city: 'Madrid',
        address: 'Calle Educación 50',
        phone: '914567890',
        email: 'info@itm.edu'
    })
})
.then(response => response.json())
.then(scenter => {
    console.log('Centro creado:', scenter);
});
```

## Ejemplos de Aplicaciones

### Aplicar a una oferta (autenticado)
```javascript
// POST /api/applications
fetch(`${API_BASE_URL}/api/applications`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
        offerId: 1,
        message: 'Estoy muy interesado en esta oportunidad. Mi experiencia en desarrollo web me permite aportar valor desde el primer día.'
    })
})
.then(response => response.json())
.then(application => {
    console.log('Aplicación enviada:', application);
});
```

### Obtener aplicaciones del usuario (autenticado)
```javascript
// GET /api/applications/user/123
fetch(`${API_BASE_URL}/api/applications/user/123`, {
    method: 'GET',
    headers: authHeaders
})
.then(response => response.json())
.then(applications => {
    console.log('Mis aplicaciones:', applications);
});
```

### Obtener aplicaciones de una oferta (empresa)
```javascript
// GET /api/applications/offer/1
fetch(`${API_BASE_URL}/api/applications/offer/1`, {
    method: 'GET',
    headers: authHeaders
})
.then(response => response.json())
.then(applications => {
    console.log('Aplicaciones para la oferta:', applications);
});
```

### Actualizar estado de aplicación (empresa)
```javascript
// PUT /api/applications/1/status
fetch(`${API_BASE_URL}/api/applications/1/status`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
        status: 'accepted',
        companyNotes: 'Perfil muy interesante, contactaremos pronto.'
    })
})
.then(response => response.json())
.then(result => {
    console.log('Estado actualizado:', result);
});
```

## Ejemplos de Tokens de Empresa

### Obtener balance de tokens
```javascript
// GET /api/tokens/balance
fetch(`${API_BASE_URL}/api/tokens/balance`, {
    method: 'GET',
    headers: authHeaders
})
.then(response => response.json())
.then(balance => {
    console.log('Balance de tokens:', balance);
});
```

### Recargar tokens
```javascript
// POST /api/tokens/recharge
fetch(`${API_BASE_URL}/api/tokens/recharge`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
        amount: 50
    })
})
.then(response => response.json())
.then(result => {
    console.log('Tokens recargados:', result);
});
```

### Buscar estudiantes usando tokens
```javascript
// POST /api/tokens/search-students
fetch(`${API_BASE_URL}/api/tokens/search-students`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
        profamilyId: 1,
        grade: 'superior',
        car: true,
        limit: 10
    })
})
.then(response => response.json())
.then(result => {
    console.log('Estudiantes encontrados:', result.students);
    console.log('Tokens utilizados:', result.tokensUsed);
});
```

### Acceder al CV usando tokens
```javascript
// POST /api/tokens/access-cv/123
fetch(`${API_BASE_URL}/api/tokens/access-cv/123`, {
    method: 'POST',
    headers: authHeaders
})
.then(response => response.json())
.then(result => {
    console.log('CV del estudiante:', result.student);
    console.log('Tokens utilizados:', result.tokensUsed);
});
```

## Manejo de Errores

```javascript
// Función auxiliar para manejar errores
function handleApiResponse(response) {
    if (!response.ok) {
        return response.json().then(errorData => {
            throw new Error(errorData.mensaje || errorData.message || 'Error en la API');
        });
    }
    return response.json();
}

// Ejemplo de uso con manejo de errores
fetch(`${API_BASE_URL}/api/offers`, {
    method: 'GET',
    headers: publicHeaders
})
.then(handleApiResponse)
.then(offers => {
    console.log('Ofertas:', offers);
})
.catch(error => {
    console.error('Error:', error.message);
    // Mostrar error al usuario
});
```

## Función Helper para Requests Autenticados

```javascript
// Función helper para realizar peticiones autenticadas
async function authenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
        if (response.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('authToken');
            window.location.href = '/login';
            throw new Error('Sesión expirada');
        }
        const errorData = await response.json();
        throw new Error(errorData.mensaje || errorData.message || 'Error en la API');
    }
    
    return response.json();
}

// Ejemplo de uso
authenticatedRequest(`${API_BASE_URL}/api/offers`, {
    method: 'POST',
    body: JSON.stringify({
        name: 'Nueva Oferta',
        location: 'Barcelona',
        // ... otros campos
    })
})
.then(offer => {
    console.log('Oferta creada:', offer);
})
.catch(error => {
    console.error('Error:', error.message);
});
```

## Filtrado y Búsqueda

```javascript
// Aunque no está implementado en el backend, aquí hay ejemplos de cómo podrías filtrar en el frontend
function filterOffers(offers, filters) {
    return offers.filter(offer => {
        if (filters.location && !offer.location.toLowerCase().includes(filters.location.toLowerCase())) {
            return false;
        }
        if (filters.mode && offer.mode !== filters.mode) {
            return false;
        }
        if (filters.sector && !offer.sector.toLowerCase().includes(filters.sector.toLowerCase())) {
            return false;
        }
        if (filters.minHours && offer.min_hr < filters.minHours) {
            return false;
        }
        return true;
    });
}

// Ejemplo de uso
fetch(`${API_BASE_URL}/api/offers`)
.then(response => response.json())
.then(offers => {
    const filteredOffers = filterOffers(offers, {
        location: 'madrid',
        mode: 'presencial',
        sector: 'tecnología'
    });
    console.log('Ofertas filtradas:', filteredOffers);
});
```

## Notas Importantes

1. **Tokens JWT**: Los tokens tienen una duración limitada. Implementa lógica para renovar tokens o redirigir al login cuando expire.

2. **Validación**: Siempre valida los datos en el frontend antes de enviarlos al backend.

3. **Loading States**: Implementa estados de carga para mejorar la experiencia del usuario.

4. **Error Handling**: Maneja diferentes tipos de errores (red, servidor, validación, etc.).

5. **Optimización**: Para listas grandes, considera implementar paginación o lazy loading.

6. **Seguridad**: Nunca guardes información sensible en localStorage. Usa cookies httpOnly para tokens si es posible.

Este archivo te proporciona una base sólida para integrar el frontend con el backend. Ajusta los ejemplos según las necesidades específicas de tu aplicación.
