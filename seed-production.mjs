#!/usr/bin/env node

/**
 * Script de seed para producción - Datos esenciales completos
 * Este script pobla la base de datos con TODOS los datos necesarios para producción
 * incluyendo datos base del sistema y datos de prueba para testing.
 *
 * CARACTERÍSTICAS:
 * - NO elimina datos existentes, solo agrega nuevos registros usando findOrCreate
 * - Incluye datos base esenciales + datos de prueba por defecto
 * - Se ejecuta automáticamente al correr: node seed-production.mjs
 * - Para p          console.log(`🏢 Compañías: ${stats.companies}`);     console.log(`🏫 Centros educativos: ${stats.scenters}`);oducción real, modificar las secciones de datos de prueba
 */

import sequelize from './src/database/database.js';
import { KnowledgeArea, Profamily, Career, Skill, User, Student, Company, Offer, Scenter, ScenterProfamily } from './src/models/relations.js';
import bcrypt from 'bcrypt';

async function seedAllData() {
    try {
        console.log('🚀 Iniciando poblamiento completo de base de datos...');

        // 1. POBLAR DATOS BASE ESENCIALES
        console.log('📚 Poblando áreas de conocimiento...');

        const knowledgeAreasData = [
            {
                name: 'Ciencias Físico-Matemáticas y las Ingenierías',
                description: 'Estudio de las ciencias exactas y su aplicación tecnológica',
                focus: 'Estudio de las ciencias exactas (Matemáticas, Física, Astronomía, Ciencias de la Computación) y su aplicación práctica para el desarrollo tecnológico, la construcción y la industria.',
                profamilys: [
                    'Ingeniería Civil', 'Ingeniería Mecánica', 'Ingeniería Eléctrica', 'Ingeniería Electrónica',
                    'Ingeniería Industrial', 'Ingeniería en Sistemas', 'Ingeniería Aeronáutica', 'Ingeniería Química',
                    'Matemáticas', 'Física', 'Ciencias de la Computación', 'Arquitectura', 'Diseño Industrial'
                ]
            },
            {
                name: 'Ciencias Biológicas, Químicas y de la Salud',
                description: 'Estudio de los seres vivos, la salud y procesos químicos',
                focus: 'Estudio de los seres vivos, la vida, la salud humana y animal, los procesos químicos y biológicos.',
                profamilys: [
                    'Medicina', 'Enfermería', 'Odontología', 'Veterinaria', 'Fisioterapia', 'Nutrición y Dietética',
                    'Psicología', 'Biología', 'Química', 'Bioquímica', 'Farmacia', 'Ciencias Ambientales',
                    'Ingeniería Biomédica', 'Terapia Ocupacional', 'Podología'
                ]
            },
            {
                name: 'Ciencias Sociales y Administrativas',
                description: 'Estudio de grupos humanos, relaciones sociales y gestión',
                focus: 'Estudio de los grupos humanos, las relaciones sociales, la economía, la política y la gestión de organizaciones.',
                profamilys: [
                    'Administración de Empresas', 'Contaduría Pública', 'Economía', 'Finanzas', 'Marketing',
                    'Recursos Humanos', 'Sociología', 'Antropología', 'Ciencia Política', 'Relaciones Internacionales',
                    'Geografía', 'Derecho', 'Ciencias de la Comunicación', 'Periodismo', 'Turismo',
                    'Trabajo Social', 'Educación Social'
                ]
            },
            {
                name: 'Humanidades y Artes',
                description: 'Estudio del pensamiento humano, cultura y expresión artística',
                focus: 'Estudio del pensamiento humano, la historia, la cultura, el lenguaje, la estética, las manifestaciones artísticas y el acervo cultural.',
                profamilys: [
                    'Filosofía', 'Historia', 'Filología', 'Lingüística', 'Pedagogía', 'Educación Infantil',
                    'Educación Primaria', 'Psicopedagogía', 'Artes Visuales', 'Música', 'Teatro', 'Cine',
                    'Diseño Gráfico', 'Historia del Arte', 'Conservación y Restauración', 'Artes Escénicas',
                    'Diseño de Moda'
                ]
            }
        ];

        for (const areaData of knowledgeAreasData) {
            const knowledgeArea = await KnowledgeArea.findOrCreate({
                where: { name: areaData.name },
                defaults: { name: areaData.name, description: areaData.description, focus: areaData.focus }
            });

            for (const profamilyName of areaData.profamilys) {
                await Profamily.findOrCreate({
                    where: { name: profamilyName },
                    defaults: { name: profamilyName, description: `Familia profesional: ${profamilyName}`, knowledgeAreaId: knowledgeArea[0].id }
                });
            }
        }

        // Skills básicos
        console.log('🎯 Poblando skills...');

        const basicSkills = [
            'Comunicación', 'Trabajo en equipo', 'Inglés', 'Francés', 'Alemán', 'Ofimática', 'Resolución de problemas',
            'Adaptabilidad', 'Gestión del tiempo', 'Liderazgo', 'Creatividad', 'Responsabilidad', 'Atención al cliente',
            'Empatía', 'Tolerancia al estrés', 'Pensamiento crítico', 'Aprendizaje continuo', 'Ética profesional',
            'Orientación al detalle', 'Iniciativa', 'Negociación', 'Toma de decisiones', 'Gestión de conflictos',
            'Motivación', 'Coaching', 'Mentoring', 'Programación', 'Matemáticas', 'Estadística', 'Análisis de datos',
            'Redacción', 'Presentaciones', 'Investigación', 'Documentación técnica', 'Gestión de proyectos',
            'Metodologías ágiles', 'Control de versiones (Git)', 'Bases de datos SQL', 'Bases de datos NoSQL',
            'APIs REST', 'Testing de software', 'DevOps', 'Cloud Computing', 'Ciberseguridad', 'JavaScript',
            'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript', 'React', 'Angular',
            'Vue.js', 'Node.js', 'Express.js', 'Django', 'Spring Boot', 'Laravel', '.NET', 'HTML/CSS',
            'SASS/SCSS', 'Bootstrap', 'Tailwind CSS', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker',
            'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Linux', 'Windows Server', 'macOS', 'Adobe Photoshop',
            'Adobe Illustrator', 'Adobe XD', 'Figma', 'Sketch', 'InVision', 'UI/UX Design', 'Diseño gráfico',
            'Diseño web', 'Branding', 'Identidad corporativa', 'Análisis financiero', 'Contabilidad',
            'Planificación estratégica', 'Marketing digital', 'SEO/SEM', 'Social Media', 'E-commerce',
            'CRM', 'ERP', 'Business Intelligence', 'Data Analytics', 'Machine Learning', 'Inteligencia Artificial',
            'Primeros auxilios', 'Anatomía', 'Fisiología', 'Farmacología', 'Atención al paciente',
            'Higiene hospitalaria', 'Registro médico', 'Telemedicina', 'Pedagogía', 'Didáctica',
            'Evaluación educativa', 'Tecnologías educativas', 'Inclusión educativa', 'Orientación vocacional',
            'Dibujo', 'Pintura', 'Escultura', 'Fotografía', 'Video', 'Edición de video', 'Producción musical',
            'Interpretación musical', 'Danza', 'Actuación', 'Dirección artística'
        ];

        for (const skillName of basicSkills) {
            await Skill.findOrCreate({ where: { name: skillName } });
        }

        // Carreras
        console.log('🎓 Poblando carreras...');

        const careersData = [
            // Ingeniería Civil
            { name: 'Ingeniería Civil', profamilyName: 'Ingeniería Civil' },
            { name: 'Arquitectura Técnica', profamilyName: 'Ingeniería Civil' },
            { name: 'Construcción', profamilyName: 'Ingeniería Civil' },
            { name: 'Urbanismo', profamilyName: 'Ingeniería Civil' },

            // Ingeniería Mecánica
            { name: 'Ingeniería Mecánica', profamilyName: 'Ingeniería Mecánica' },
            { name: 'Mecatrónica', profamilyName: 'Ingeniería Mecánica' },
            { name: 'Automoción', profamilyName: 'Ingeniería Mecánica' },
            { name: 'Manufactura', profamilyName: 'Ingeniería Mecánica' },

            // Ingeniería Eléctrica
            { name: 'Ingeniería Eléctrica', profamilyName: 'Ingeniería Eléctrica' },
            { name: 'Ingeniería de Potencia', profamilyName: 'Ingeniería Eléctrica' },
            { name: 'Electrónica de Potencia', profamilyName: 'Ingeniería Eléctrica' },
            { name: 'Automatización Industrial', profamilyName: 'Ingeniería Eléctrica' },

            // Ingeniería Electrónica
            { name: 'Ingeniería Electrónica', profamilyName: 'Ingeniería Electrónica' },
            { name: 'Telecomunicaciones', profamilyName: 'Ingeniería Electrónica' },
            { name: 'Sistemas Embebidos', profamilyName: 'Ingeniería Electrónica' },
            { name: 'Robótica', profamilyName: 'Ingeniería Electrónica' },

            // Ingeniería Industrial
            { name: 'Ingeniería Industrial', profamilyName: 'Ingeniería Industrial' },
            { name: 'Logística', profamilyName: 'Ingeniería Industrial' },
            { name: 'Calidad', profamilyName: 'Ingeniería Industrial' },
            { name: 'Producción', profamilyName: 'Ingeniería Industrial' },

            // Ingeniería en Sistemas
            { name: 'Ingeniería en Sistemas', profamilyName: 'Ingeniería en Sistemas' },
            { name: 'Ingeniería Informática', profamilyName: 'Ingeniería en Sistemas' },
            { name: 'Desarrollo de Software', profamilyName: 'Ingeniería en Sistemas' },
            { name: 'Analista de Sistemas', profamilyName: 'Ingeniería en Sistemas' },

            // Ingeniería Aeronáutica
            { name: 'Ingeniería Aeronáutica', profamilyName: 'Ingeniería Aeronáutica' },
            { name: 'Ingeniería Aeroespacial', profamilyName: 'Ingeniería Aeronáutica' },
            { name: 'Piloto de Aeronaves', profamilyName: 'Ingeniería Aeronáutica' },

            // Ingeniería Química
            { name: 'Ingeniería Química', profamilyName: 'Ingeniería Química' },
            { name: 'Química Industrial', profamilyName: 'Ingeniería Química' },
            { name: 'Procesos Químicos', profamilyName: 'Ingeniería Química' },

            // Matemáticas y Física
            { name: 'Matemáticas', profamilyName: 'Matemáticas' },
            { name: 'Estadística', profamilyName: 'Matemáticas' },
            { name: 'Actuaría', profamilyName: 'Matemáticas' },
            { name: 'Física', profamilyName: 'Física' },
            { name: 'Física Aplicada', profamilyName: 'Física' },

            // Ciencias de la Computación
            { name: 'Ciencias de la Computación', profamilyName: 'Ciencias de la Computación' },
            { name: 'Inteligencia Artificial', profamilyName: 'Ciencias de la Computación' },
            { name: 'Ciberseguridad', profamilyName: 'Ciencias de la Computación' },
            { name: 'Big Data', profamilyName: 'Ciencias de la Computación' },

            // Arquitectura y Diseño
            { name: 'Arquitectura', profamilyName: 'Arquitectura' },
            { name: 'Diseño Industrial', profamilyName: 'Diseño Industrial' },
            { name: 'Diseño de Interiores', profamilyName: 'Diseño Industrial' },

            // Salud
            { name: 'Medicina', profamilyName: 'Medicina' },
            { name: 'Medicina Familiar', profamilyName: 'Medicina' },
            { name: 'Cirugía', profamilyName: 'Medicina' },
            { name: 'Pediatría', profamilyName: 'Medicina' },
            { name: 'Ginecología', profamilyName: 'Medicina' },
            { name: 'Enfermería', profamilyName: 'Enfermería' },
            { name: 'Enfermería Pediátrica', profamilyName: 'Enfermería' },
            { name: 'Enfermería Quirúrgica', profamilyName: 'Enfermería' },
            { name: 'Odontología', profamilyName: 'Odontología' },
            { name: 'Ortodoncia', profamilyName: 'Odontología' },
            { name: 'Veterinaria', profamilyName: 'Veterinaria' },
            { name: 'Fisioterapia', profamilyName: 'Fisioterapia' },
            { name: 'Terapia Ocupacional', profamilyName: 'Fisioterapia' },
            { name: 'Nutrición y Dietética', profamilyName: 'Nutrición y Dietética' },
            { name: 'Psicología', profamilyName: 'Psicología' },
            { name: 'Psicología Clínica', profamilyName: 'Psicología' },
            { name: 'Psicología Educativa', profamilyName: 'Psicología' },

            // Ciencias Biológicas y Químicas
            { name: 'Biología', profamilyName: 'Biología' },
            { name: 'Microbiología', profamilyName: 'Biología' },
            { name: 'Genética', profamilyName: 'Biología' },
            { name: 'Química', profamilyName: 'Química' },
            { name: 'Bioquímica', profamilyName: 'Bioquímica' },
            { name: 'Farmacia', profamilyName: 'Farmacia' },
            { name: 'Ciencias Ambientales', profamilyName: 'Ciencias Ambientales' },
            { name: 'Ingeniería Biomédica', profamilyName: 'Ingeniería Biomédica' },

            // Administración y Economía
            { name: 'Administración de Empresas', profamilyName: 'Administración de Empresas' },
            { name: 'Dirección de Empresas', profamilyName: 'Administración de Empresas' },
            { name: 'Emprendimiento', profamilyName: 'Administración de Empresas' },
            { name: 'Contaduría Pública', profamilyName: 'Contaduría Pública' },
            { name: 'Auditoría', profamilyName: 'Contaduría Pública' },
            { name: 'Economía', profamilyName: 'Economía' },
            { name: 'Finanzas', profamilyName: 'Finanzas' },
            { name: 'Banca', profamilyName: 'Finanzas' },
            { name: 'Marketing', profamilyName: 'Marketing' },
            { name: 'Publicidad', profamilyName: 'Marketing' },
            { name: 'Recursos Humanos', profamilyName: 'Recursos Humanos' },
            { name: 'Gestión del Talento', profamilyName: 'Recursos Humanos' },

            // Ciencias Sociales
            { name: 'Sociología', profamilyName: 'Sociología' },
            { name: 'Antropología', profamilyName: 'Antropología' },
            { name: 'Ciencia Política', profamilyName: 'Ciencia Política' },
            { name: 'Relaciones Internacionales', profamilyName: 'Relaciones Internacionales' },
            { name: 'Geografía', profamilyName: 'Geografía' },
            { name: 'Geografía Humana', profamilyName: 'Geografía' },

            // Derecho y Comunicación
            { name: 'Derecho', profamilyName: 'Derecho' },
            { name: 'Abogacía', profamilyName: 'Derecho' },
            { name: 'Notariado', profamilyName: 'Derecho' },
            { name: 'Ciencias de la Comunicación', profamilyName: 'Ciencias de la Comunicación' },
            { name: 'Periodismo', profamilyName: 'Periodismo' },
            { name: 'Comunicación Audiovisual', profamilyName: 'Ciencias de la Comunicación' },

            // Turismo y Servicios
            { name: 'Turismo', profamilyName: 'Turismo' },
            { name: 'Gestión Hotelera', profamilyName: 'Turismo' },
            { name: 'Agencias de Viajes', profamilyName: 'Turismo' },
            { name: 'Trabajo Social', profamilyName: 'Trabajo Social' },
            { name: 'Educación Social', profamilyName: 'Educación Social' },

            // Humanidades
            { name: 'Filosofía', profamilyName: 'Filosofía' },
            { name: 'Historia', profamilyName: 'Historia' },
            { name: 'Historia del Arte', profamilyName: 'Historia' },
            { name: 'Filología', profamilyName: 'Filología' },
            { name: 'Lingüística', profamilyName: 'Lingüística' },
            { name: 'Traducción', profamilyName: 'Filología' },
            { name: 'Pedagogía', profamilyName: 'Pedagogía' },
            { name: 'Educación Infantil', profamilyName: 'Educación Infantil' },
            { name: 'Educación Primaria', profamilyName: 'Educación Primaria' },
            { name: 'Psicopedagogía', profamilyName: 'Psicopedagogía' },

            // Artes
            { name: 'Bellas Artes', profamilyName: 'Artes Visuales' },
            { name: 'Diseño Gráfico', profamilyName: 'Diseño Gráfico' },
            { name: 'Fotografía', profamilyName: 'Artes Visuales' },
            { name: 'Música', profamilyName: 'Música' },
            { name: 'Interpretación Musical', profamilyName: 'Música' },
            { name: 'Composición Musical', profamilyName: 'Música' },
            { name: 'Teatro', profamilyName: 'Teatro' },
            { name: 'Dirección Escénica', profamilyName: 'Teatro' },
            { name: 'Cine', profamilyName: 'Cine' },
            { name: 'Dirección Cinematográfica', profamilyName: 'Cine' },
            { name: 'Historia del Arte', profamilyName: 'Historia del Arte' },
            { name: 'Conservación y Restauración', profamilyName: 'Conservación y Restauración' },
            { name: 'Diseño de Moda', profamilyName: 'Diseño de Moda' }
        ];

        for (const careerData of careersData) {
            const profamily = await Profamily.findOne({ where: { name: careerData.profamilyName } });
            if (profamily) {
                await Career.findOrCreate({
                    where: { name: careerData.name, profamilyId: profamily.id },
                    defaults: { name: careerData.name, description: `Carrera en ${careerData.name}`, profamilyId: profamily.id, isActive: true }
                });
            }
        }

        // Centros educativos afiliados (SCENTERS)
        console.log('🏫 Poblando centros educativos afiliados...');

        const scentersData = [
            {
                name: 'Instituto Tecnológico Superior de Madrid',
                code: 'ITS-MAD',
                city: 'Madrid',
                address: 'Calle Tecnología 123, Madrid',
                phone: '+34 91 123 45 67',
                email: 'info@its-madrid.edu',
                active: true,
                profamilys: ['Desarrollo de Software', 'Administración y Gestión', 'Sanidad']
            },
            {
                name: 'Centro de Formación Profesional Barcelona',
                code: 'CFP-BCN',
                city: 'Barcelona',
                address: 'Avenida Industrial 456, Barcelona',
                phone: '+34 93 456 78 90',
                email: 'info@cfp-barcelona.edu',
                active: true,
                profamilys: ['Construcción', 'Electricidad y Electrónica', 'Transporte y Mantenimiento']
            },
            {
                name: 'Escuela Técnica Superior Sevilla',
                code: 'ETS-SEV',
                city: 'Sevilla',
                address: 'Plaza Técnica 789, Sevilla',
                phone: '+34 95 567 89 01',
                email: 'info@ets-sevilla.edu',
                active: true,
                profamilys: ['Turismo', 'Marketing', 'Servicios Socioculturales']
            },
            {
                name: 'Instituto Profesional Valencia',
                code: 'IP-VAL',
                city: 'Valencia',
                address: 'Calle Profesional 321, Valencia',
                phone: '+34 96 345 67 89',
                email: 'info@ip-valencia.edu',
                active: true,
                profamilys: ['Informática y Comunicaciones', 'Imagen Personal', 'Administración y Gestión']
            }
        ];

        for (const scenterData of scentersData) {
            const scenter = await Scenter.findOrCreate({
                where: { code: scenterData.code },
                defaults: {
                    name: scenterData.name,
                    code: scenterData.code,
                    city: scenterData.city,
                    address: scenterData.address,
                    phone: scenterData.phone,
                    email: scenterData.email,
                    active: scenterData.active
                }
            });

            // Crear relaciones con profamilys
            for (const profamilyName of scenterData.profamilys) {
                const profamily = await Profamily.findOne({ where: { name: profamilyName } });
                if (profamily) {
                    await ScenterProfamily.findOrCreate({
                        where: {
                            scenterId: scenter[0].id,
                            profamilyId: profamily.id
                        },
                        defaults: {
                            scenterId: scenter[0].id,
                            profamilyId: profamily.id
                        }
                    });
                }
            }
        }

        console.log('🧪 Poblando datos de prueba...');

        // Compañías de prueba
        const companiesData = [
            { username: 'techsolutions_rrhh', email: 'rrhh@techsolutions.es', password: 'test123', role: 'company',
              name: 'TechSolutions España', code: 'TS001', city: 'Madrid', address: 'Calle Gran Vía 123, Madrid',
              phone: '+34 91 123 45 67', web: 'https://techsolutions.es', sector: 'Tecnología',
              description: 'Empresa líder en desarrollo de software y soluciones tecnológicas.' },
            { username: 'constructora_talento', email: 'talento@constructora-moderna.com', password: 'test123', role: 'company',
              name: 'Constructora Moderna SL', code: 'CM002', city: 'Barcelona', address: 'Avenida Diagonal 456, Barcelona',
              phone: '+34 93 456 78 90', web: 'https://constructora-moderna.com', sector: 'Construcción',
              description: 'Empresa constructora especializada en edificación sostenible.' },
            { username: 'saludplus_recursos', email: 'recursos@saludplus.es', password: 'test123', role: 'company',
              name: 'Clínica Salud Plus', code: 'SP003', city: 'Sevilla', address: 'Calle de la Salud 789, Sevilla',
              phone: '+34 95 567 89 01', web: 'https://saludplus.es', sector: 'Salud',
              description: 'Centro médico privado especializado en atención primaria.' },
            { username: 'bancoinnovador_empleo', email: 'empleo@bancoinnovador.es', password: 'test123', role: 'company',
              name: 'Banco Innovador SA', code: 'BI004', city: 'Madrid', address: 'Plaza del Banco 321, Madrid',
              phone: '+34 91 234 56 78', web: 'https://bancoinnovador.es', sector: 'Finanzas',
              description: 'Entidad financiera moderna especializada en servicios bancarios digitales.' },
            { username: 'escuela_futuro', email: 'direccion@escuela-futuro.edu', password: 'test123', role: 'company',
              name: 'Escuela Primaria Futuro', code: 'EF005', city: 'Valencia', address: 'Calle Educación 654, Valencia',
              phone: '+34 96 345 67 89', web: 'https://escuela-futuro.edu', sector: 'Educación',
              description: 'Centro educativo privado especializado en educación infantil.' }
        ];

        for (const companyData of companiesData) {
            const [user] = await User.findOrCreate({
                where: { email: companyData.email },
                defaults: {
                    username: companyData.username,
                    email: companyData.email,
                    password: companyData.password,
                    role: companyData.role,
                    active: true,
                    status: 'active'
                }
            });

            if (user) {
                await Company.findOrCreate({
                    where: { email: companyData.email },
                    defaults: {
                        name: companyData.name,
                        code: companyData.code,
                        city: companyData.city,
                        active: true,
                        address: companyData.address,
                        phone: companyData.phone,
                        email: companyData.email,
                        web: companyData.web,
                        sector: companyData.sector,
                        description: companyData.description,
                        userId: user.id
                    }
                });
            }
        }

        // Estudiantes de prueba con diferentes niveles de completitud
        const studentsData = [
            { username: 'maria_garcia', email: 'maria.garcia@email.com', password: 'test123', role: 'student',
              name: 'María', surname: 'García López', grade: '4º ESO', course: 'Ciencias', car: true,
              description: 'Estudiante motivada interesada en carreras científicas, especialmente medicina.',
              photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face' },
            { username: 'carlos_rodriguez', email: 'carlos.rodriguez@email.com', password: 'test123', role: 'student',
              name: 'Carlos', surname: 'Rodríguez Martín', grade: '3º ESO', course: 'Tecnología', car: false,
              description: 'Apasionado por la tecnología y la programación. Me gustaría estudiar Ingeniería Informática.',
              photo: null },
            { username: 'ana_martinez', email: 'ana.martinez@email.com', password: 'test123', role: 'student',
              name: 'Ana', surname: 'Martínez Sánchez', grade: '2º Bachillerato', course: 'Humanidades', car: true,
              description: null, photo: null },
            { username: 'david_lopez', email: 'david.lopez@email.com', password: 'test123', role: 'student',
              name: 'David', surname: 'López Fernández', grade: '1º ESO', course: 'General', car: null,
              description: null, photo: null },
            { username: 'laura_gonzalez', email: 'laura.gonzalez@email.com', password: 'test123', role: 'student',
              name: 'Laura', surname: 'González Ruiz', grade: null, course: null, car: null,
              description: null, photo: null },
            { username: 'javier_moreno', email: 'javier.moreno@email.com', password: 'test123', role: 'student',
              name: 'Javier', surname: 'Moreno Jiménez', grade: '2º CFGS Desarrollo de Aplicaciones Web', course: 'Informática', car: true,
              description: 'Estudiante de FP Superior en Desarrollo de Aplicaciones Web. Tengo conocimientos en JavaScript, React y Node.js.',
              photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
            { username: 'sofia_perez', email: 'sofia.perez@email.com', password: 'test123', role: 'student',
              name: 'Sofía', surname: 'Pérez Müller', grade: '3º ESO', course: 'Idiomas', car: false,
              description: 'Estudiante bilingüe español-alemán interesada en Relaciones Internacionales.',
              photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face' }
        ];

        for (const studentData of studentsData) {
            const [user] = await User.findOrCreate({
                where: { email: studentData.email },
                defaults: {
                    username: studentData.username,
                    email: studentData.email,
                    password: studentData.password,
                    role: studentData.role,
                    name: studentData.name,
                    surname: studentData.surname,
                    active: true,
                    status: 'active'
                }
            });

            if (user) {
                await Student.findOrCreate({
                    where: { userId: user.id },
                    defaults: {
                        grade: studentData.grade,
                        course: studentData.course,
                        car: studentData.car,
                        description: studentData.description,
                        photo: studentData.photo,
                        userId: user.id,
                        active: true
                    }
                });
            }
        }

        // Estadísticas finales
        const stats = {
            areas: await KnowledgeArea.count(),
            profamilys: await Profamily.count(),
            careers: await Career.count(),
            skills: await Skill.count(),
            scenters: await Scenter.count(),
            scenterRelations: await ScenterProfamily.count(),
            companies: await Company.count(),
            students: await Student.count(),
            users: await User.count()
        };

        console.log('\n📊 POBLAMIENTO COMPLETADO:');
        console.log('=====================================');
        console.log(`📚 Áreas de conocimiento: ${stats.areas}`);
        console.log(`🏢 Familias profesionales: ${stats.profamilys}`);
        console.log(`🎓 Carreras: ${stats.careers}`);
        console.log(`🎯 Skills: ${stats.skills}`);
        console.log(`� Centros educativos: ${stats.scenters}`);
        console.log(`🔗 Relaciones scenter-profamily: ${stats.scenterRelations}`);
        console.log(`�🏢 Compañías: ${stats.companies}`);
        console.log(`🎓 Estudiantes: ${stats.students}`);
        console.log(`👥 Total usuarios: ${stats.users}`);
        console.log('\n✅ Base de datos lista para producción y testing');
        console.log('🔑 Credenciales de prueba: email + password: test123');

    } catch (error) {
        console.error('❌ Error poblando datos:', error);
        throw error;
    }
}

// EJECUCIÓN AUTOMÁTICA
async function main() {
    try {
        console.log('🎯 Ejecutando seed de producción...');
        console.log('📁 Directorio:', process.cwd());

        await sequelize.authenticate();
        console.log('📡 Conexión a BD establecida');

        await seedAllData();

        console.log('\n🎉 ¡POBLAMIENTO COMPLETADO EXITOSAMENTE!');
        console.log('💡 El sistema está listo para producción');

    } catch (error) {
        console.error('💥 Error fatal:', error.message);
        console.error('Stack completo:', error.stack);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('🔐 Conexión cerrada');
    }
}

// Ejecutar automáticamente si se llama directamente
console.log('🔍 Debug info:');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);
console.log('normalized argv[1]:', process.argv[1].replace(/\\/g, '/'));
console.log('expected:', `file:///${process.argv[1].replace(/\\/g, '/')}`);
console.log('are equal?', import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`);

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    console.log('🎯 Iniciando ejecución del script de seed...');
    main().catch(error => {
        console.error('💥 Error en ejecución:', error.message);
        process.exit(1);
    });
} else {
    console.log('📦 Script de seed importado como módulo');
}