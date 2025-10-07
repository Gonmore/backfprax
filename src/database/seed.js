import sequelize from "../database/database.js";
import { User } from "../models/users.js";
import { Company } from "../models/company.js";
import { Scenter } from "../models/scenter.js";
import { Offer } from "../models/offer.js";
import { Student } from "../models/student.js";
import { Profamily } from "../models/profamily.js";
import { Tutor } from "../models/tutor.js";
import { Application } from "../models/application.js";
import { Skill } from "../models/skill.js";
import { StudentSkill } from "../models/studentSkill.js";
import { OfferSkill } from "../models/offerSkill.js";
import UserCompany from "../models/userCompany.js";
import { UserScenter } from "../models/userScenter.js";
import { Cv } from "../models/cv.js";
import { CvSkill } from '../models/cvSkill.js';
import { AcademicVerification } from "../models/academicVerification.js";
import logger from '../logs/logger.js';

async function seedDatabase(forceReset = false) {
try {
        logger.info('🌱 Iniciando seed completo de producción...');

        // Sincronizar base de datos
        const syncOptions = forceReset ? { force: true } : { alter: true };
        logger.info(`🔄 Sincronizando base de datos ${forceReset ? '(FORCE RESET)' : '(ALTER MODE)'}...`);
        await sequelize.sync(syncOptions);

        // 1. Crear Skills por categorías
        logger.info('🛠️ Creando skills profesionales...');
        const skills = await Skill.bulkCreate([
            // Desarrollo Web
            { name: "HTML/CSS", category: "Desarrollo Web" },
            { name: "JavaScript", category: "Desarrollo Web" },
            { name: "React", category: "Desarrollo Web" },
            { name: "Node.js", category: "Desarrollo Web" },
            { name: "Express.js", category: "Desarrollo Web" },
            { name: "MongoDB", category: "Desarrollo Web" },
            { name: "PostgreSQL", category: "Desarrollo Web" },

            // Desarrollo Móvil
            { name: "React Native", category: "Desarrollo Móvil" },
            { name: "Flutter", category: "Desarrollo Móvil" },
            { name: "Android Studio", category: "Desarrollo Móvil" },
            { name: "iOS Development", category: "Desarrollo Móvil" },

            // Diseño
            { name: "Adobe Photoshop", category: "Diseño" },
            { name: "Adobe Illustrator", category: "Diseño" },
            { name: "Figma", category: "Diseño" },
            { name: "UI/UX Design", category: "Diseño" },

            // Marketing Digital
            { name: "Google Ads", category: "Marketing Digital" },
            { name: "Facebook Ads", category: "Marketing Digital" },
            { name: "SEO/SEM", category: "Marketing Digital" },
            { name: "Social Media Marketing", category: "Marketing Digital" },
            { name: "Google Analytics", category: "Marketing Digital" },

            // Administración
            { name: "Contabilidad", category: "Administración" },
            { name: "Excel Avanzado", category: "Administración" },
            { name: "Gestión de Proyectos", category: "Administración" },
            { name: "Recursos Humanos", category: "Administración" },

            // Sanidad
            { name: "Auxiliar de Enfermería", category: "Sanidad" },
            { name: "Farmacia", category: "Sanidad" },
            { name: "Laboratorio Clínico", category: "Sanidad" },
            { name: "Primeros Auxilios", category: "Sanidad" },

            // Educación
            { name: "Educación Infantil", category: "Educación" },
            { name: "Pedagogía", category: "Educación" },
            { name: "Integración Social", category: "Educación" },
            { name: "Animación Sociocultural", category: "Educación" },

            // Idiomas
            { name: "Inglés", category: "Idiomas" },
            { name: "Francés", category: "Idiomas" },
            { name: "Alemán", category: "Idiomas" },
            { name: "Italiano", category: "Idiomas" }
        ], { ignoreDuplicates: true });

        // Obtener todos los skills existentes (incluyendo los que ya estaban)
        const allSkills = await Skill.findAll();
        logger.info(`📊 Skills totales en BD: ${allSkills.length}`);

        // 2. Crear Familias Profesionales completas
        logger.info('📚 Creando familias profesionales completas...');
        const profamilies = await Profamily.bulkCreate([
            {
                name: "Informática y Comunicaciones",
                description: "Desarrollo de software, redes, ciberseguridad, sistemas informáticos y comunicaciones"
            },
            {
                name: "Administración y Gestión",
                description: "Gestión empresarial, contabilidad, finanzas, recursos humanos, administración pública"
            },
            {
                name: "Comercio y Marketing",
                description: "Ventas, marketing digital, comercio internacional, logística, transporte"
            },
            {
                name: "Sanidad",
                description: "Auxiliar de enfermería, farmacia, laboratorio clínico, radiología, fisioterapia"
            },
            {
                name: "Servicios Socioculturales y a la Comunidad",
                description: "Educación infantil, integración social, animación sociocultural, turismo"
            },
            {
                name: "Hostelería y Turismo",
                description: "Cocina, servicios de restauración, recepción hotelera, guía turístico"
            },
            {
                name: "Actividades Físicas y Deportivas",
                description: "Animación de actividades físico-deportivas, acondicionamiento físico"
            },
            {
                name: "Industrias Alimentarias",
                description: "Elaboración de productos alimentarios, control de calidad, nutrición"
            },
            {
                name: "Instalación y Mantenimiento",
                description: "Electrotecnia, mantenimiento industrial, instalaciones térmicas"
            },
            {
                name: "Fabricación Mecánica",
                description: "Mecánica, soldadura, mantenimiento de vehículos"
            },
            {
                name: "Edificación y Obra Civil",
                description: "Construcción, albañilería, carpintería, fontanería, electricidad"
            },
            {
                name: "Electricidad y Electrónica",
                description: "Instalaciones eléctricas, electrónica industrial, domótica, telecomunicaciones"
            },
            {
                name: "Energía y Agua",
                description: "Energías renovables, mantenimiento de instalaciones térmicas, tratamiento de aguas"
            },
            {
                name: "Transporte y Mantenimiento de Vehículos",
                description: "Mecánica de automóviles, electromecánica, carrozado, pintura automotriz"
            },
            {
                name: "Agraria",
                description: "Jardinería, agricultura ecológica, ganadería, forestal"
            },
            {
                name: "Marítimo-Pesquera",
                description: "Navegación, pesca, acuicultura, mantenimiento de embarcaciones"
            },
            {
                name: "Química",
                description: "Laboratorio químico, procesos químicos industriales, control de calidad"
            },
            {
                name: "Seguridad y Medio Ambiente",
                description: "Prevención de riesgos laborales, emergencias, gestión medioambiental"
            },
            {
                name: "Textil, Confección y Piel",
                description: "Confección industrial, patronaje, diseño de moda, marroquinería"
            },
            {
                name: "Vidrio y Cerámica",
                description: "Fabricación de vidrio, cerámica, decoración cerámica"
            },
            {
                name: "Madera, Mueble y Corcho",
                description: "Carpintería, ebanistería, fabricación de muebles, restauración"
            },
            {
                name: "Imagen y Sonido",
                description: "Producción audiovisual, sonido, iluminación, fotografía"
            },
            {
                name: "Imagen Personal",
                description: "Peluquería, estética, cosmética, masaje, asesoría de imagen"
            },
            {
                name: "Artes Gráficas",
                description: "Diseño gráfico, impresión digital, preimpresión, encuadernación"
            },
            {
                name: "Industrias Extractivas",
                description: "Minería, cantería, perforaciones, tratamiento de minerales"
            },
            {
                name: "Artes y Artesanías",
                description: "Artes plásticas, artesanía tradicional, restauración artística"
            }
        ], { ignoreDuplicates: true });

        // Obtener todas las familias profesionales existentes
        const allProfamilies = await Profamily.findAll();

        // 3. Crear Centros de Estudios
        logger.info('🏫 Creando centros de estudios...');
        const scenters = await Scenter.bulkCreate([
            {
                name: "IES Tecnológico Madrid",
                code: "IES001",
                city: "Madrid",
                address: "Calle Tecnología 123",
                phone: "911234567",
                email: "info@iestecnologico.edu.es",
                codigo_postal: "28001",
                active: true
            },
            {
                name: "Centro de FP Avanzada Barcelona",
                code: "CFP002",
                city: "Barcelona",
                address: "Avda. Innovación 456",
                phone: "931234567",
                email: "contacto@fpavanzada.edu.es",
                codigo_postal: "08001",
                active: true
            },
            {
                name: "Instituto Superior Valencia",
                code: "ISV003",
                city: "Valencia",
                address: "Plaza Educación 789",
                phone: "961234567",
                email: "admin@isuvalencia.edu.es",
                codigo_postal: "46001",
                active: true
            },
            {
                name: "Centro Profesional Sevilla",
                code: "CPS004",
                city: "Sevilla",
                address: "Calle Formación 321",
                phone: "954567890",
                email: "info@cpsevilla.edu.es",
                codigo_postal: "41001",
                active: true
            }
        ], { ignoreDuplicates: true });

        // Obtener todos los centros existentes
        const allScenters = await Scenter.findAll();

        // 4. Crear Usuarios (al menos 3 de cada rol)
        logger.info('👥 Creando usuarios de producción...');
        const users = await User.bulkCreate([
            // Estudiantes (6 estudiantes)
            {
                username: "estudiante1",
                email: "juan.perez@test.com",
                password: "123456",
                role: "student",
                name: "Juan",
                surname: "Pérez García",
                phone: "600111111",
                description: "Estudiante de desarrollo web full-stack",
                active: true,
                status: "active"
            },
            {
                username: "estudiante2",
                email: "maria.gonzalez@test.com",
                password: "123456",
                role: "student",
                name: "María",
                surname: "González López",
                phone: "600222222",
                description: "Estudiante de marketing digital",
                active: true,
                status: "active"
            },
            {
                username: "estudiante3",
                email: "carlos.ruiz@test.com",
                password: "123456",
                role: "student",
                name: "Carlos",
                surname: "Ruiz Martínez",
                phone: "600333333",
                description: "Estudiante de administración y finanzas",
                active: true,
                status: "active"
            },
            {
                username: "estudiante4",
                email: "ana.lopez@test.com",
                password: "123456",
                role: "student",
                name: "Ana",
                surname: "López Sánchez",
                phone: "600444444",
                description: "Estudiante de auxiliar de enfermería",
                active: true,
                status: "active"
            },
            {
                username: "estudiante5",
                email: "david.martin@test.com",
                password: "123456",
                role: "student",
                name: "David",
                surname: "Martín Torres",
                phone: "600555555",
                description: "Estudiante de educación infantil",
                active: true,
                status: "active"
            },
            {
                username: "estudiante6",
                email: "laura.sanchez@test.com",
                password: "123456",
                role: "student",
                name: "Laura",
                surname: "Sánchez Moreno",
                phone: "600666666",
                description: "Estudiante de diseño gráfico",
                active: true,
                status: "active"
            },

            // Empresas (4 empresas)
            {
                username: "empresa1",
                email: "rrhh@techsolutions.es",
                password: "123456",
                role: "company",
                name: "María",
                surname: "García Rodríguez",
                phone: "911111111",
                description: "RRHH en TechSolutions España",
                active: true,
                status: "active"
            },
            {
                username: "empresa2",
                email: "practicas@consultoriabcn.es",
                password: "123456",
                role: "company",
                name: "Pedro",
                surname: "Martínez Silva",
                phone: "932222222",
                description: "Coordinador de prácticas en Consultoría Empresarial BCN",
                active: true,
                status: "active"
            },
            {
                username: "empresa3",
                email: "recursos@healthcare.es",
                password: "123456",
                role: "company",
                name: "Ana",
                surname: "López Fernández",
                phone: "963333333",
                description: "Jefa de RRHH en HealthCare Valencia",
                active: true,
                status: "active"
            },
            {
                username: "empresa4",
                email: "talento@marketingpro.es",
                password: "123456",
                role: "company",
                name: "Carlos",
                surname: "Ruiz Gómez",
                phone: "954444444",
                description: "Director de Talento en Marketing Digital Pro",
                active: true,
                status: "active"
            },

            // Centros de Estudios (4 centros)
            {
                username: "centro1",
                email: "coordinador@iestecnologico.edu.es",
                password: "123456",
                role: "scenter",
                name: "Roberto",
                surname: "Fernández López",
                phone: "911234567",
                description: "Coordinador de FP en IES Tecnológico Madrid",
                active: true,
                status: "active"
            },
            {
                username: "centro2",
                email: "director@fpavanzada.edu.es",
                password: "123456",
                role: "scenter",
                name: "Carmen",
                surname: "Silva Martín",
                phone: "931234567",
                description: "Directora del Centro de FP Avanzada Barcelona",
                active: true,
                status: "active"
            },
            {
                username: "centro3",
                email: "jefe@isuvalencia.edu.es",
                password: "123456",
                role: "scenter",
                name: "Miguel",
                surname: "Moreno Ruiz",
                phone: "961234567",
                description: "Jefe de Estudios en Instituto Superior Valencia",
                active: true,
                status: "active"
            },
            {
                username: "centro4",
                email: "coordinadora@cpsevilla.edu.es",
                password: "123456",
                role: "scenter",
                name: "Isabel",
                surname: "Torres García",
                phone: "954567890",
                description: "Coordinadora de Prácticas en Centro Profesional Sevilla",
                active: true,
                status: "active"
            },

            // Tutores (3 tutores)
            {
                username: "tutor1",
                email: "carmen.fernandez@ies001.edu",
                password: "123456",
                role: "tutor",
                name: "Carmen",
                surname: "Fernández López",
                phone: "600777777",
                description: "Tutora de prácticas en desarrollo web",
                active: true,
                status: "active"
            },
            {
                username: "tutor2",
                email: "roberto.silva@fp002.edu",
                password: "123456",
                role: "tutor",
                name: "Roberto",
                surname: "Silva Martín",
                phone: "600888888",
                description: "Tutor de prácticas en administración",
                active: true,
                status: "active"
            },
            {
                username: "tutor3",
                email: "laura.morales@is003.edu",
                password: "123456",
                role: "tutor",
                name: "Laura",
                surname: "Morales Ruiz",
                phone: "600999999",
                description: "Tutora de prácticas en sanidad",
                active: true,
                status: "active"
            },

            // Admin
            {
                username: "admin",
                email: "admin@ausbildung.com",
                password: "admin123",
                role: "admin",
                name: "Administrador",
                surname: "Sistema",
                phone: "900000000",
                description: "Administrador del sistema Ausbildung",
                active: true,
                status: "active"
            }
        ], { ignoreDuplicates: true });

        // Obtener todos los usuarios existentes
        const allUsers = await User.findAll();
        const companies = await Company.bulkCreate([
            {
                name: "TechSolutions España",
                code: "TECH001",
                city: "Madrid",
                address: "Calle Innovation 100",
                phone: "911111111",
                email: "rrhh@techsolutions.es",
                web: "www.techsolutions.es",
                sector: "Tecnología",
                rrhh: "Maria García",
                main: "Desarrollo de software",
                description: "Empresa líder en desarrollo de aplicaciones web y móviles",
                userId: allUsers.find(u => u.email === 'rrhh@techsolutions.es').id,
                active: true
            },
            {
                name: "Consultoría Empresarial BCN",
                code: "CONS002",
                city: "Barcelona",
                address: "Rambla Negocio 200",
                phone: "932222222",
                email: "practicas@consultoriabcn.es",
                web: "www.consultoriabcn.es",
                sector: "Consultoría",
                rrhh: "Pedro Martinez",
                main: "Consultoría de gestión",
                description: "Asesoramiento integral para empresas",
                userId: allUsers.find(u => u.email === 'practicas@consultoriabcn.es').id,
                active: true
            },
            {
                name: "HealthCare Valencia",
                code: "HEAL003",
                city: "Valencia",
                address: "Avda. Salud 300",
                phone: "963333333",
                email: "recursos@healthcare.es",
                web: "www.healthcare.es",
                sector: "Sanidad",
                rrhh: "Ana López",
                main: "Servicios sanitarios",
                description: "Centro de servicios de salud especializados",
                userId: allUsers.find(u => u.email === 'recursos@healthcare.es').id,
                active: true
            },
            {
                name: "Marketing Digital Pro",
                code: "MARK004",
                city: "Sevilla",
                address: "Calle Publicidad 400",
                phone: "954444444",
                email: "talento@marketingpro.es",
                web: "www.marketingpro.es",
                sector: "Marketing",
                rrhh: "Carlos Ruiz",
                main: "Marketing digital y publicidad",
                description: "Agencia de marketing digital y comunicación",
                userId: allUsers.find(u => u.email === 'talento@marketingpro.es').id,
                active: true
            }
        ], { ignoreDuplicates: true });

        // Obtener todas las empresas existentes
        const allCompanies = await Company.findAll();        // 6. Crear relaciones Empresa-Usuario
        logger.info('🔗 Creando relaciones empresa-usuario...');
        await UserCompany.bulkCreate([
            { userId: allUsers.find(u => u.email === 'rrhh@techsolutions.es').id, companyId: allCompanies.find(c => c.code === 'TECH001').id, isActive: true },
            { userId: allUsers.find(u => u.email === 'practicas@consultoriabcn.es').id, companyId: allCompanies.find(c => c.code === 'CONS002').id, isActive: true },
            { userId: allUsers.find(u => u.email === 'recursos@healthcare.es').id, companyId: allCompanies.find(c => c.code === 'HEAL003').id, isActive: true },
            { userId: allUsers.find(u => u.email === 'talento@marketingpro.es').id, companyId: allCompanies.find(c => c.code === 'MARK004').id, isActive: true }
        ], { ignoreDuplicates: true });

        // 7. Crear relaciones Centro-Usuario
        logger.info('🔗 Creando relaciones centro-usuario...');
        await UserScenter.bulkCreate([
            { userId: allUsers.find(u => u.email === 'coordinador@iestecnologico.edu.es').id, scenterId: allScenters.find(s => s.code === 'IES001').id, isActive: true },
            { userId: allUsers.find(u => u.email === 'director@fpavanzada.edu.es').id, scenterId: allScenters.find(s => s.code === 'CFP002').id, isActive: true },
            { userId: allUsers.find(u => u.email === 'jefe@isuvalencia.edu.es').id, scenterId: allScenters.find(s => s.code === 'ISV003').id, isActive: true },
            { userId: allUsers.find(u => u.email === 'coordinadora@cpsevilla.edu.es').id, scenterId: allScenters.find(s => s.code === 'CPS004').id, isActive: true }
        ], { ignoreDuplicates: true });

        // 8. Crear perfiles de estudiantes con profamilyId
        logger.info('🎓 Creando perfiles de estudiantes...');
        const students = await Student.bulkCreate([
            {
                userId: allUsers.find(u => u.email === 'juan.perez@test.com').id,
                grade: "Grado Superior",
                course: "Desarrollo de Aplicaciones Web",
                double: false,
                car: true,
                active: true,
                tag: "Full Stack Developer",
                description: "Especializado en React, Node.js y PostgreSQL",
                disp: "2024-09-01",
                profamilyId: allProfamilies.find(p => p.name === "Informática y Comunicaciones").id
            },
            {
                userId: allUsers.find(u => u.email === 'maria.gonzalez@test.com').id,
                grade: "Grado Superior",
                course: "Marketing y Publicidad",
                double: false,
                car: false,
                active: true,
                tag: "Digital Marketing",
                description: "Enfocado en redes sociales, SEO y Google Ads",
                disp: "2024-10-15",
                profamilyId: allProfamilies.find(p => p.name === "Comercio y Marketing").id
            },
            {
                userId: allUsers.find(u => u.email === 'carlos.ruiz@test.com').id,
                grade: "Grado Superior",
                course: "Administración y Finanzas",
                double: true,
                car: true,
                active: true,
                tag: "Gestión Empresarial",
                description: "Conocimientos en contabilidad, Excel y RRHH",
                disp: "2024-11-01",
                profamilyId: allProfamilies.find(p => p.name === "Administración y Gestión").id
            },
            {
                userId: allUsers.find(u => u.email === 'ana.lopez@test.com').id,
                grade: "Grado Medio",
                course: "Auxiliar de Enfermería",
                double: false,
                car: false,
                active: true,
                tag: "Sanidad",
                description: "Formación en primeros auxilios y cuidados básicos",
                disp: "2024-09-15",
                profamilyId: allProfamilies.find(p => p.name === "Sanidad").id
            },
            {
                userId: allUsers.find(u => u.email === 'david.martin@test.com').id,
                grade: "Grado Medio",
                course: "Educación Infantil",
                double: false,
                car: true,
                active: true,
                tag: "Educación",
                description: "Especializado en pedagogía infantil y animación",
                disp: "2024-10-01",
                profamilyId: allProfamilies.find(p => p.name === "Servicios Socioculturales y a la Comunidad").id
            },
            {
                userId: allUsers.find(u => u.email === 'laura.sanchez@test.com').id,
                grade: "Grado Superior",
                course: "Diseño Gráfico",
                double: false,
                car: false,
                active: true,
                tag: "UI/UX Designer",
                description: "Experiencia en Photoshop, Illustrator y Figma",
                disp: "2024-11-15",
                profamilyId: allProfamilies.find(p => p.name === "Informática y Comunicaciones").id
            }
        ], { ignoreDuplicates: true });

        // Obtener todos los estudiantes existentes
        const allStudents = await Student.findAll();

        // 8.5. Crear CVs para estudiantes
        logger.info('📄 Creando CVs para estudiantes...');
        const cvs = await Cv.bulkCreate([
            {
                studentId: allStudents.find(s => s.userId === allUsers.find(u => u.email === 'juan.perez@test.com').id).id,
                summary: "Desarrollador web full-stack con experiencia en React, Node.js y PostgreSQL",
                contactEmail: "juan.perez@test.com",
                contactPhone: "600111111",
                academicBackground: {
                    scenter: allScenters.find(s => s.code === 'IES001').id,
                    profamily: allProfamilies.find(p => p.name === "Informática y Comunicaciones").id,
                    status: "egresado"
                },
                academicVerificationStatus: "verified",
                isComplete: true,
                availability: "immediate"
            },
            {
                studentId: allStudents.find(s => s.userId === allUsers.find(u => u.email === 'maria.gonzalez@test.com').id).id,
                summary: "Especialista en marketing digital con conocimientos en redes sociales y Google Ads",
                contactEmail: "maria.gonzalez@test.com",
                contactPhone: "600222222",
                academicBackground: {
                    scenter: allScenters.find(s => s.code === 'CFP002').id,
                    profamily: allProfamilies.find(p => p.name === "Comercio y Marketing").id,
                    status: "egresado"
                },
                academicVerificationStatus: "verified",
                isComplete: true,
                availability: "1_month"
            },
            {
                studentId: allStudents.find(s => s.userId === allUsers.find(u => u.email === 'carlos.ruiz@test.com').id).id,
                summary: "Estudiante de administración con conocimientos en contabilidad y gestión empresarial",
                contactEmail: "carlos.ruiz@test.com",
                contactPhone: "600333333",
                academicBackground: {
                    scenter: allScenters.find(s => s.code === 'IES001').id,
                    profamily: allProfamilies.find(p => p.name === "Administración y Gestión").id,
                    status: "por_egresar"
                },
                academicVerificationStatus: "unverified",
                isComplete: true,
                availability: "3_months"
            },
            {
                studentId: allStudents.find(s => s.userId === allUsers.find(u => u.email === 'ana.lopez@test.com').id).id,
                summary: "Auxiliar de enfermería con formación en primeros auxilios y cuidados básicos",
                contactEmail: "ana.lopez@test.com",
                contactPhone: "600444444",
                academicBackground: {
                    scenter: allScenters.find(s => s.code === 'ISV003').id,
                    profamily: allProfamilies.find(p => p.name === "Sanidad").id,
                    status: "egresado"
                },
                academicVerificationStatus: "verified",
                isComplete: true,
                availability: "immediate"
            },
            {
                studentId: allStudents.find(s => s.userId === allUsers.find(u => u.email === 'david.martin@test.com').id).id,
                summary: "Educador infantil con experiencia en pedagogía y animación sociocultural",
                contactEmail: "david.martin@test.com",
                contactPhone: "600555555",
                academicBackground: {
                    scenter: allScenters.find(s => s.code === 'CFP002').id,
                    profamily: allProfamilies.find(p => p.name === "Servicios Socioculturales y a la Comunidad").id,
                    status: "por_egresar"
                },
                academicVerificationStatus: "unverified",
                isComplete: true,
                availability: "6_months"
            },
            {
                studentId: allStudents.find(s => s.userId === allUsers.find(u => u.email === 'laura.sanchez@test.com').id).id,
                summary: "Diseñadora gráfica con experiencia en Photoshop, Illustrator y Figma",
                contactEmail: "laura.sanchez@test.com",
                contactPhone: "600666666",
                academicBackground: {
                    scenter: allScenters.find(s => s.code === 'ISV003').id,
                    profamily: allProfamilies.find(p => p.name === "Informática y Comunicaciones").id,
                    status: "por_egresar"
                },
                academicVerificationStatus: "unverified",
                isComplete: true,
                availability: "3_months"
            }
        ], { ignoreDuplicates: true });

        // Obtener todos los CVs existentes
        const allCvs = await Cv.findAll();

        // 9. Crear skills para CVs de estudiantes
        logger.info('🎯 Asignando skills a CVs de estudiantes...');
        await CvSkill.bulkCreate([
            // Juan Pérez - Desarrollo Web
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'juan.perez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "HTML/CSS").id, proficiencyLevel: "alto" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'juan.perez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "JavaScript").id, proficiencyLevel: "alto" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'juan.perez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "React").id, proficiencyLevel: "medio" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'juan.perez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Node.js").id, proficiencyLevel: "medio" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'juan.perez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Express.js").id, proficiencyLevel: "medio" },

            // María González - Marketing Digital
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'maria.gonzalez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Google Ads").id, proficiencyLevel: "alto" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'maria.gonzalez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Facebook Ads").id, proficiencyLevel: "alto" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'maria.gonzalez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "SEO/SEM").id, proficiencyLevel: "medio" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'maria.gonzalez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Social Media Marketing").id, proficiencyLevel: "medio" },

            // Carlos Ruiz - Administración
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'carlos.ruiz@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Excel Avanzado").id, proficiencyLevel: "alto" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'carlos.ruiz@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Gestión de Proyectos").id, proficiencyLevel: "medio" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'carlos.ruiz@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Recursos Humanos").id, proficiencyLevel: "medio" },

            // Ana López - Sanidad
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'ana.lopez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Auxiliar de Enfermería").id, proficiencyLevel: "medio" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'ana.lopez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Primeros Auxilios").id, proficiencyLevel: "alto" },

            // David Martín - Educación
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'david.martin@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Educación Infantil").id, proficiencyLevel: "alto" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'david.martin@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Pedagogía").id, proficiencyLevel: "medio" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'david.martin@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Animación Sociocultural").id, proficiencyLevel: "medio" },

            // Laura Sánchez - Diseño
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'laura.sanchez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Adobe Photoshop").id, proficiencyLevel: "alto" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'laura.sanchez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Adobe Illustrator").id, proficiencyLevel: "alto" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'laura.sanchez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "Figma").id, proficiencyLevel: "medio" },
            { cvId: allCvs.find(cv => cv.studentId === allStudents.find(s => s.userId === allUsers.find(u => u.email === 'laura.sanchez@test.com').id).id).id, skillId: allSkills.find(s => s.name === "UI/UX Design").id, proficiencyLevel: "medio" }
        ], { ignoreDuplicates: true });

        // 10. Crear Tutores
        logger.info('👨‍🏫 Creando tutores...');
        const tutors = await Tutor.bulkCreate([
            {
                id: "TUT001",
                name: "Carmen Fernández López",
                email: "carmen.fernandez@ies001.edu",
                grade: "A",
                degree: "Ingeniería Informática"
            },
            {
                id: "TUT002",
                name: "Roberto Silva Martín",
                email: "roberto.silva@fp002.edu",
                grade: "A",
                degree: "Administración de Empresas"
            },
            {
                id: "TUT003",
                name: "Laura Morales Ruiz",
                email: "laura.morales@is003.edu",
                grade: "B",
                degree: "Enfermería"
            }
        ], { ignoreDuplicates: true });

        // Obtener todos los tutores existentes
        const allTutors = await Tutor.findAll();

        // 11. Crear Ofertas de Prácticas (2 por empresa)
        logger.info('💼 Creando ofertas de prácticas...');
        const offers = await Offer.bulkCreate([
            // TechSolutions España - 2 ofertas
            {
                companyId: allCompanies.find(c => c.code === 'TECH001').id,
                name: "Desarrollador Web Full Stack",
                description: "Buscamos estudiante de DAW para desarrollar aplicaciones web modernas",
                requisites: "Conocimientos de React, Node.js, PostgreSQL",
                location: "Madrid",
                mode: "presencial",
                type: "FP Dual",
                period: "6 meses",
                schedule: "Jornada completa",
                min_hr: 800,
                car: true,
                sector: "Tecnología",
                tag: "Desarrollo Web",
                jobs: "Desarrollo de aplicaciones web, mantenimiento de sistemas",
                active: true
            },
            {
                companyId: allCompanies.find(c => c.code === 'TECH001').id,
                name: "Desarrollador Frontend React",
                description: "Proyecto de desarrollo de interfaz de usuario moderna",
                requisites: "React, JavaScript, CSS avanzado",
                location: "Madrid (híbrido)",
                mode: "hibrido",
                type: "FP Dual",
                period: "4 meses",
                schedule: "Jornada completa",
                min_hr: 750,
                car: false,
                sector: "Tecnología",
                tag: "Frontend Development",
                jobs: "Desarrollo de interfaces de usuario, optimización UX/UI",
                active: true
            },

            // Consultoría Empresarial BCN - 2 ofertas
            {
                companyId: allCompanies.find(c => c.code === 'CONS002').id,
                name: "Consultor Junior de Gestión",
                description: "Apoyo en proyectos de consultoría empresarial",
                requisites: "Excel avanzado, PowerPoint, análisis de datos",
                location: "Barcelona",
                mode: "presencial",
                type: "FP Dual",
                period: "6 meses",
                schedule: "Jornada completa",
                min_hr: 900,
                car: false,
                sector: "Consultoría",
                tag: "Consultoría Empresarial",
                jobs: "Análisis de datos, elaboración de informes, soporte administrativo",
                active: true
            },
            {
                companyId: allCompanies.find(c => c.code === 'CONS002').id,
                name: "Analista de RRHH",
                description: "Gestión de procesos de selección y formación",
                requisites: "Recursos Humanos, Excel, comunicación",
                location: "Barcelona",
                mode: "presencial",
                type: "FP Dual",
                period: "8 meses",
                schedule: "Jornada completa",
                min_hr: 850,
                car: false,
                sector: "Consultoría",
                tag: "Recursos Humanos",
                jobs: "Selección de personal, formación, gestión administrativa",
                active: true
            },

            // HealthCare Valencia - 2 ofertas
            {
                companyId: allCompanies.find(c => c.code === 'HEAL003').id,
                name: "Auxiliar de Enfermería",
                description: "Apoyo en consultas médicas y cuidados básicos",
                requisites: "Curso auxiliar de enfermería, primeros auxilios",
                location: "Valencia",
                mode: "presencial",
                type: "FP Dual",
                period: "6 meses",
                schedule: "Jornada completa",
                min_hr: 950,
                car: false,
                sector: "Sanidad",
                tag: "Sanidad",
                jobs: "Atención al paciente, apoyo en consultas, cuidados básicos",
                active: true
            },
            {
                companyId: allCompanies.find(c => c.code === 'HEAL003').id,
                name: "Recepcionista Administrativo",
                description: "Gestión de citas y administración sanitaria",
                requisites: "Administración, atención al cliente, informática básica",
                location: "Valencia",
                mode: "presencial",
                type: "FP Dual",
                period: "4 meses",
                schedule: "Media jornada",
                min_hr: 700,
                car: false,
                sector: "Sanidad",
                tag: "Administración Sanitaria",
                jobs: "Gestión de citas, atención telefónica, archivo administrativo",
                active: true
            },

            // Marketing Digital Pro - 2 ofertas
            {
                companyId: allCompanies.find(c => c.code === 'MARK004').id,
                name: "Community Manager",
                description: "Gestión de redes sociales y contenido digital",
                requisites: "Redes sociales, diseño gráfico, copywriting",
                location: "Sevilla (remoto)",
                mode: "remoto",
                type: "FP Dual",
                period: "6 meses",
                schedule: "Jornada completa",
                min_hr: 750,
                car: false,
                sector: "Marketing",
                tag: "Social Media",
                jobs: "Gestión de redes sociales, creación de contenido, análisis de métricas",
                active: true
            },
            {
                companyId: allCompanies.find(c => c.code === 'MARK004').id,
                name: "Especialista en Google Ads",
                description: "Gestión de campañas publicitarias en Google",
                requisites: "Google Ads, Google Analytics, marketing digital",
                location: "Sevilla",
                mode: "hibrido",
                type: "FP Dual",
                period: "5 meses",
                schedule: "Jornada completa",
                min_hr: 800,
                car: false,
                sector: "Marketing",
                tag: "Google Ads",
                jobs: "Gestión de campañas PPC, optimización de conversiones, reporting",
                active: true
            }
        ], { ignoreDuplicates: true });

        // Obtener todas las ofertas existentes
        const allOffers = await Offer.findAll();

        // 12. Asignar skills a las ofertas
        logger.info('🔗 Asignando skills a ofertas...');
        await OfferSkill.bulkCreate([
            { offerId: allOffers[0].id, skillId: allSkills.find(s => s.name === "HTML/CSS").id, requiredLevel: "intermediate" },
            { offerId: allOffers[0].id, skillId: allSkills.find(s => s.name === "JavaScript").id, requiredLevel: "intermediate" },
            { offerId: allOffers[0].id, skillId: allSkills.find(s => s.name === "React").id, requiredLevel: "beginner" },
            { offerId: allOffers[0].id, skillId: allSkills.find(s => s.name === "Node.js").id, requiredLevel: "beginner" },

            // Oferta 2 - Desarrollador Frontend React
            { offerId: allOffers[1].id, skillId: allSkills.find(s => s.name === "HTML/CSS").id, requiredLevel: "advanced" },
            { offerId: allOffers[1].id, skillId: allSkills.find(s => s.name === "JavaScript").id, requiredLevel: "advanced" },
            { offerId: allOffers[1].id, skillId: allSkills.find(s => s.name === "React").id, requiredLevel: "intermediate" },

            // Oferta 3 - Consultor Junior
            { offerId: allOffers[2].id, skillId: allSkills.find(s => s.name === "Excel Avanzado").id, requiredLevel: "advanced" },
            { offerId: allOffers[2].id, skillId: allSkills.find(s => s.name === "Gestión de Proyectos").id, requiredLevel: "beginner" },

            // Oferta 4 - Analista RRHH
            { offerId: allOffers[3].id, skillId: allSkills.find(s => s.name === "Recursos Humanos").id, requiredLevel: "intermediate" },
            { offerId: allOffers[3].id, skillId: allSkills.find(s => s.name === "Excel Avanzado").id, requiredLevel: "intermediate" },

            // Oferta 5 - Auxiliar de Enfermería
            { offerId: allOffers[4].id, skillId: allSkills.find(s => s.name === "Auxiliar de Enfermería").id, requiredLevel: "intermediate" },
            { offerId: allOffers[4].id, skillId: allSkills.find(s => s.name === "Primeros Auxilios").id, requiredLevel: "beginner" },

            // Oferta 6 - Recepcionista Administrativo
            { offerId: allOffers[5].id, skillId: allSkills.find(s => s.name === "Contabilidad").id, requiredLevel: "beginner" },
            { offerId: allOffers[5].id, skillId: allSkills.find(s => s.name === "Excel Avanzado").id, requiredLevel: "beginner" },

            // Oferta 7 - Community Manager
            { offerId: allOffers[6].id, skillId: allSkills.find(s => s.name === "Social Media Marketing").id, requiredLevel: "intermediate" },
            { offerId: allOffers[6].id, skillId: allSkills.find(s => s.name === "Adobe Photoshop").id, requiredLevel: "beginner" },
            { offerId: allOffers[6].id, skillId: allSkills.find(s => s.name === "Adobe Illustrator").id, requiredLevel: "beginner" },

            // Oferta 8 - Especialista Google Ads
            { offerId: allOffers[7].id, skillId: allSkills.find(s => s.name === "Google Ads").id, requiredLevel: "advanced" },
            { offerId: allOffers[7].id, skillId: allSkills.find(s => s.name === "Google Analytics").id, requiredLevel: "intermediate" },
            { offerId: allOffers[7].id, skillId: allSkills.find(s => s.name === "SEO/SEM").id, requiredLevel: "intermediate" }
        ], { ignoreDuplicates: true });

        // 13. Crear verificaciones académicas (algunos estudiantes verificados, otros no)
        logger.info('📜 Creando verificaciones académicas...');
        await AcademicVerification.bulkCreate([
            // Estudiantes verificados
            {
                studentId: allStudents.find(s => s.userId === allUsers.find(u => u.email === 'juan.perez@test.com').id).id,
                scenterId: allScenters.find(s => s.code === 'IES001').id,
                tutorId: allTutors.find(t => t.id === "TUT001").id,
                academicData: {
                    scenter: allScenters.find(s => s.code === 'IES001').id,
                    profamily: allProfamilies.find(p => p.name === "Informática y Comunicaciones").id,
                    status: "approved",
                    additionalInfo: "Estudiante destacado en desarrollo web"
                },
                course: "Desarrollo de Aplicaciones Web",
                grade: "Grado Superior",
                academicYear: "2023-2024",
                status: "approved",
                verifiedAt: new Date(),
                comments: "Estudiante destacado en desarrollo web"
            },
            {
                studentId: allStudents.find(s => s.userId === allUsers.find(u => u.email === 'maria.gonzalez@test.com').id).id,
                scenterId: allScenters.find(s => s.code === 'CFP002').id,
                tutorId: allTutors.find(t => t.id === "TUT002").id,
                academicData: {
                    scenter: allScenters.find(s => s.code === 'CFP002').id,
                    profamily: allProfamilies.find(p => p.name === "Comercio y Marketing").id,
                    status: "approved",
                    additionalInfo: "Excelente rendimiento en prácticas de marketing"
                },
                course: "Marketing y Publicidad",
                grade: "Grado Superior",
                academicYear: "2023-2024",
                status: "approved",
                verifiedAt: new Date(),
                comments: "Excelente rendimiento en prácticas de marketing"
            },
            {
                studentId: allStudents.find(s => s.userId === allUsers.find(u => u.email === 'ana.lopez@test.com').id).id,
                scenterId: allScenters.find(s => s.code === 'ISV003').id,
                tutorId: allTutors.find(t => t.id === "TUT003").id,
                academicData: {
                    scenter: allScenters.find(s => s.code === 'ISV003').id,
                    profamily: allProfamilies.find(p => p.name === "Sanidad").id,
                    status: "approved",
                    additionalInfo: "Muy buena disposición para el trabajo en sanidad"
                },
                course: "Auxiliar de Enfermería",
                grade: "Grado Medio",
                academicYear: "2023-2024",
                status: "approved",
                verifiedAt: new Date(),
                comments: "Muy buena disposición para el trabajo en sanidad"
            },
            // Estudiantes NO verificados (sin verificación académica)
            // Carlos Ruiz (estudiante3), David Martín (estudiante5), Laura Sánchez (estudiante6) no tienen verificación
        ], { ignoreDuplicates: true });

        logger.info('✅ Seed de producción completado exitosamente!');
        logger.info(`📊 Datos creados:
        - ${allSkills.length} skills profesionales
        - ${allProfamilies.length} familias profesionales
        - ${allScenters.length} centros de estudios
        - ${allCompanies.length} empresas
        - ${allUsers.length} usuarios (${allUsers.filter(u => u.role === 'student').length} estudiantes, ${allUsers.filter(u => u.role === 'company').length} empresas, ${allUsers.filter(u => u.role === 'scenter').length} centros, ${allUsers.filter(u => u.role === 'tutor').length} tutores, ${allUsers.filter(u => u.role === 'admin').length} admin)
        - ${allStudents.length} perfiles de estudiantes
        - ${allCvs.length} CVs de estudiantes
        - ${allTutors.length} tutores
        - ${allOffers.length} ofertas de prácticas
        - ${allOffers.length * 2} relaciones skill-oferta (aprox)
        - ${allStudents.filter((_, i) => [0, 1, 3].includes(i)).length} estudiantes con verificación académica`);

        return {
            success: true,
            data: {
                skills: allSkills.length,
                profamilies: allProfamilies.length,
                scenters: allScenters.length,
                companies: allCompanies.length,
                users: allUsers.length,
                students: allStudents.length,
                cvs: allCvs.length,
                tutors: allTutors.length,
                offers: allOffers.length,
                academicVerifications: 3 // estudiantes verificados
            }
        };

    } catch (error) {
        logger.error('❌ Error durante el seed de producción:', error);
        throw error;
    }
}

export default seedDatabase;
