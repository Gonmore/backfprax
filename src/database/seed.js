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
import { UserCompany } from "../models/userCompany.js";
import { UserScenter } from "../models/userScenter.js";
import { AcademicVerification } from "../models/academicVerification.js";
import logger from '../logs/logger.js';

async function seedDatabase() {
    try {
        logger.info('🌱 Iniciando seed completo de producción...');

        // Sincronizar base de datos
        await sequelize.sync({ alter: true });

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
            }
        ], { ignoreDuplicates: true });

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

        // 4. Crear Empresas
        logger.info('🏢 Creando empresas...');
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
                active: true
            }
        ], { ignoreDuplicates: true });

        // 5. Crear Usuarios (al menos 3 de cada rol)
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

        // 6. Crear relaciones Empresa-Usuario
        logger.info('🔗 Creando relaciones empresa-usuario...');
        await UserCompany.bulkCreate([
            { userId: 7, companyId: 1, isActive: true }, // empresa1 -> TechSolutions
            { userId: 8, companyId: 2, isActive: true }, // empresa2 -> Consultoría BCN
            { userId: 9, companyId: 3, isActive: true }, // empresa3 -> HealthCare
            { userId: 10, companyId: 4, isActive: true } // empresa4 -> Marketing Pro
        ], { ignoreDuplicates: true });

        // 7. Crear relaciones Centro-Usuario
        logger.info('🔗 Creando relaciones centro-usuario...');
        await UserScenter.bulkCreate([
            { userId: 11, scenterId: 1, isActive: true }, // centro1 -> IES Tecnológico Madrid
            { userId: 12, scenterId: 2, isActive: true }, // centro2 -> Centro FP Barcelona
            { userId: 13, scenterId: 3, isActive: true }, // centro3 -> Instituto Superior Valencia
            { userId: 14, scenterId: 4, isActive: true }  // centro4 -> Centro Profesional Sevilla
        ], { ignoreDuplicates: true });

        // 8. Crear perfiles de estudiantes con profamilyId
        logger.info('🎓 Creando perfiles de estudiantes...');
        const students = await Student.bulkCreate([
            {
                userId: 1,
                grade: "Grado Superior",
                course: "Desarrollo de Aplicaciones Web",
                double: false,
                car: true,
                active: true,
                tag: "Full Stack Developer",
                description: "Especializado en React, Node.js y PostgreSQL",
                disp: "2024-09-01",
                profamilyId: 1 // Informática y Comunicaciones
            },
            {
                userId: 2,
                grade: "Grado Superior",
                course: "Marketing y Publicidad",
                double: false,
                car: false,
                active: true,
                tag: "Digital Marketing",
                description: "Enfocado en redes sociales, SEO y Google Ads",
                disp: "2024-10-15",
                profamilyId: 3 // Comercio y Marketing
            },
            {
                userId: 3,
                grade: "Grado Superior",
                course: "Administración y Finanzas",
                double: true,
                car: true,
                active: true,
                tag: "Gestión Empresarial",
                description: "Conocimientos en contabilidad, Excel y RRHH",
                disp: "2024-11-01",
                profamilyId: 2 // Administración y Gestión
            },
            {
                userId: 4,
                grade: "Grado Medio",
                course: "Auxiliar de Enfermería",
                double: false,
                car: false,
                active: true,
                tag: "Sanidad",
                description: "Formación en primeros auxilios y cuidados básicos",
                disp: "2024-09-15",
                profamilyId: 4 // Sanidad
            },
            {
                userId: 5,
                grade: "Grado Medio",
                course: "Educación Infantil",
                double: false,
                car: true,
                active: true,
                tag: "Educación",
                description: "Especializado en pedagogía infantil y animación",
                disp: "2024-10-01",
                profamilyId: 5 // Servicios Socioculturales
            },
            {
                userId: 6,
                grade: "Grado Superior",
                course: "Diseño Gráfico",
                double: false,
                car: false,
                active: true,
                tag: "UI/UX Designer",
                description: "Experiencia en Photoshop, Illustrator y Figma",
                disp: "2024-11-15",
                profamilyId: 1 // Informática y Comunicaciones
            }
        ], { ignoreDuplicates: true });

        // 9. Crear skills para estudiantes
        logger.info('🎯 Asignando skills a estudiantes...');
        await StudentSkill.bulkCreate([
            // Juan Pérez - Desarrollo Web
            { studentId: 1, skillId: 1, proficiencyLevel: "advanced" }, // HTML/CSS
            { studentId: 1, skillId: 2, proficiencyLevel: "advanced" }, // JavaScript
            { studentId: 1, skillId: 3, proficiencyLevel: "intermediate" }, // React
            { studentId: 1, skillId: 4, proficiencyLevel: "intermediate" }, // Node.js
            { studentId: 1, skillId: 5, proficiencyLevel: "intermediate" }, // Express.js

            // María González - Marketing Digital
            { studentId: 2, skillId: 14, proficiencyLevel: "advanced" }, // Google Ads
            { studentId: 2, skillId: 15, proficiencyLevel: "advanced" }, // Facebook Ads
            { studentId: 2, skillId: 16, proficiencyLevel: "intermediate" }, // SEO/SEM
            { studentId: 2, skillId: 17, proficiencyLevel: "intermediate" }, // Social Media Marketing

            // Carlos Ruiz - Administración
            { studentId: 3, skillId: 19, proficiencyLevel: "advanced" }, // Excel Avanzado
            { studentId: 3, skillId: 20, proficiencyLevel: "intermediate" }, // Gestión de Proyectos
            { studentId: 3, skillId: 21, proficiencyLevel: "intermediate" }, // Recursos Humanos

            // Ana López - Sanidad
            { studentId: 4, skillId: 22, proficiencyLevel: "intermediate" }, // Auxiliar de Enfermería
            { studentId: 4, skillId: 26, proficiencyLevel: "advanced" }, // Primeros Auxilios

            // David Martín - Educación
            { studentId: 5, skillId: 27, proficiencyLevel: "advanced" }, // Educación Infantil
            { studentId: 5, skillId: 28, proficiencyLevel: "intermediate" }, // Pedagogía
            { studentId: 5, skillId: 30, proficiencyLevel: "intermediate" }, // Animación Sociocultural

            // Laura Sánchez - Diseño
            { studentId: 6, skillId: 7, proficiencyLevel: "advanced" }, // Adobe Photoshop
            { studentId: 6, skillId: 8, proficiencyLevel: "advanced" }, // Adobe Illustrator
            { studentId: 6, skillId: 9, proficiencyLevel: "intermediate" }, // Figma
            { studentId: 6, skillId: 10, proficiencyLevel: "intermediate" } // UI/UX Design
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

        // 11. Crear Ofertas de Prácticas (2 por empresa)
        logger.info('💼 Creando ofertas de prácticas...');
        const offers = await Offer.bulkCreate([
            // TechSolutions España - 2 ofertas
            {
                companyId: 1,
                title: "Desarrollador Web Full Stack",
                description: "Buscamos estudiante de DAW para desarrollar aplicaciones web modernas",
                requirements: "Conocimientos de React, Node.js, PostgreSQL",
                location: "Madrid",
                workType: "presencial",
                duration: 6,
                startDate: "2024-10-01",
                endDate: "2025-04-01",
                active: true,
                salary: 800
            },
            {
                companyId: 1,
                title: "Desarrollador Frontend React",
                description: "Proyecto de desarrollo de interfaz de usuario moderna",
                requirements: "React, JavaScript, CSS avanzado",
                location: "Madrid (híbrido)",
                workType: "hibrido",
                duration: 4,
                startDate: "2024-11-01",
                endDate: "2025-03-01",
                active: true,
                salary: 750
            },

            // Consultoría Empresarial BCN - 2 ofertas
            {
                companyId: 2,
                title: "Consultor Junior de Gestión",
                description: "Apoyo en proyectos de consultoría empresarial",
                requirements: "Excel avanzado, PowerPoint, análisis de datos",
                location: "Barcelona",
                workType: "presencial",
                duration: 6,
                startDate: "2024-09-15",
                endDate: "2025-03-15",
                active: true,
                salary: 900
            },
            {
                companyId: 2,
                title: "Analista de RRHH",
                description: "Gestión de procesos de selección y formación",
                requirements: "Recursos Humanos, Excel, comunicación",
                location: "Barcelona",
                workType: "presencial",
                duration: 8,
                startDate: "2024-10-01",
                endDate: "2025-06-01",
                active: true,
                salary: 850
            },

            // HealthCare Valencia - 2 ofertas
            {
                companyId: 3,
                title: "Auxiliar de Enfermería",
                description: "Apoyo en consultas médicas y cuidados básicos",
                requirements: "Curso auxiliar de enfermería, primeros auxilios",
                location: "Valencia",
                workType: "presencial",
                duration: 6,
                startDate: "2024-09-01",
                endDate: "2025-03-01",
                active: true,
                salary: 950
            },
            {
                companyId: 3,
                title: "Recepcionista Administrativo",
                description: "Gestión de citas y administración sanitaria",
                requirements: "Administración, atención al cliente, informática básica",
                location: "Valencia",
                workType: "presencial",
                duration: 4,
                startDate: "2024-11-01",
                endDate: "2025-03-01",
                active: true,
                salary: 700
            },

            // Marketing Digital Pro - 2 ofertas
            {
                companyId: 4,
                title: "Community Manager",
                description: "Gestión de redes sociales y contenido digital",
                requirements: "Redes sociales, diseño gráfico, copywriting",
                location: "Sevilla (remoto)",
                workType: "remoto",
                duration: 6,
                startDate: "2024-10-15",
                endDate: "2025-04-15",
                active: true,
                salary: 750
            },
            {
                companyId: 4,
                title: "Especialista en Google Ads",
                description: "Gestión de campañas publicitarias en Google",
                requirements: "Google Ads, Google Analytics, marketing digital",
                location: "Sevilla",
                workType: "hibrido",
                duration: 5,
                startDate: "2024-09-20",
                endDate: "2025-02-20",
                active: true,
                salary: 800
            }
        ], { ignoreDuplicates: true });

        // 12. Asignar skills a las ofertas
        logger.info('🔗 Asignando skills a ofertas...');
        await OfferSkill.bulkCreate([
            // Oferta 1 - Desarrollador Web Full Stack
            { offerId: 1, skillId: 1, requiredLevel: "intermediate" }, // HTML/CSS
            { offerId: 1, skillId: 2, requiredLevel: "intermediate" }, // JavaScript
            { offerId: 1, skillId: 3, requiredLevel: "basic" }, // React
            { offerId: 1, skillId: 4, requiredLevel: "basic" }, // Node.js

            // Oferta 2 - Desarrollador Frontend React
            { offerId: 2, skillId: 1, requiredLevel: "advanced" }, // HTML/CSS
            { offerId: 2, skillId: 2, requiredLevel: "advanced" }, // JavaScript
            { offerId: 2, skillId: 3, requiredLevel: "intermediate" }, // React

            // Oferta 3 - Consultor Junior
            { offerId: 3, skillId: 19, requiredLevel: "advanced" }, // Excel Avanzado
            { offerId: 3, skillId: 20, requiredLevel: "basic" }, // Gestión de Proyectos

            // Oferta 4 - Analista RRHH
            { offerId: 4, skillId: 21, requiredLevel: "intermediate" }, // Recursos Humanos
            { offerId: 4, skillId: 19, requiredLevel: "intermediate" }, // Excel

            // Oferta 5 - Auxiliar de Enfermería
            { offerId: 5, skillId: 22, requiredLevel: "intermediate" }, // Auxiliar de Enfermería
            { offerId: 5, skillId: 26, requiredLevel: "basic" }, // Primeros Auxilios

            // Oferta 6 - Recepcionista Administrativo
            { offerId: 6, skillId: 18, requiredLevel: "basic" }, // Contabilidad
            { offerId: 6, skillId: 19, requiredLevel: "basic" }, // Excel

            // Oferta 7 - Community Manager
            { offerId: 7, skillId: 17, requiredLevel: "intermediate" }, // Social Media Marketing
            { offerId: 7, skillId: 7, requiredLevel: "basic" }, // Adobe Photoshop
            { offerId: 7, skillId: 8, requiredLevel: "basic" }, // Adobe Illustrator

            // Oferta 8 - Especialista Google Ads
            { offerId: 8, skillId: 14, requiredLevel: "advanced" }, // Google Ads
            { offerId: 8, skillId: 18, requiredLevel: "intermediate" }, // Google Analytics
            { offerId: 8, skillId: 16, requiredLevel: "intermediate" } // SEO/SEM
        ], { ignoreDuplicates: true });

        // 13. Crear verificaciones académicas (algunos estudiantes verificados, otros no)
        logger.info('📜 Creando verificaciones académicas...');
        await AcademicVerification.bulkCreate([
            // Estudiantes verificados
            {
                studentId: 1,
                scenterId: 1, // IES Tecnológico Madrid
                tutorId: "TUT001",
                course: "Desarrollo de Aplicaciones Web",
                grade: "Grado Superior",
                academicYear: "2023-2024",
                status: "verified",
                verifiedAt: new Date(),
                comments: "Estudiante destacado en desarrollo web"
            },
            {
                studentId: 2,
                scenterId: 2, // Centro FP Barcelona
                tutorId: "TUT002",
                course: "Marketing y Publicidad",
                grade: "Grado Superior",
                academicYear: "2023-2024",
                status: "verified",
                verifiedAt: new Date(),
                comments: "Excelente rendimiento en prácticas de marketing"
            },
            {
                studentId: 4,
                scenterId: 3, // Instituto Superior Valencia
                tutorId: "TUT003",
                course: "Auxiliar de Enfermería",
                grade: "Grado Medio",
                academicYear: "2023-2024",
                status: "verified",
                verifiedAt: new Date(),
                comments: "Muy buena disposición para el trabajo en sanidad"
            },
            // Estudiantes NO verificados (sin verificación académica)
            // Carlos Ruiz (id: 3), David Martín (id: 5), Laura Sánchez (id: 6) no tienen verificación
        ], { ignoreDuplicates: true });

        logger.info('✅ Seed de producción completado exitosamente!');
        logger.info(`📊 Datos creados:
        - ${skills.length} skills profesionales
        - ${profamilies.length} familias profesionales
        - ${scenters.length} centros de estudios
        - ${companies.length} empresas
        - ${users.length} usuarios (${users.filter(u => u.role === 'student').length} estudiantes, ${users.filter(u => u.role === 'company').length} empresas, ${users.filter(u => u.role === 'scenter').length} centros, ${users.filter(u => u.role === 'tutor').length} tutores, ${users.filter(u => u.role === 'admin').length} admin)
        - ${students.length} perfiles de estudiantes
        - ${tutors.length} tutores
        - ${offers.length} ofertas de prácticas
        - ${offers.length * 2} relaciones skill-oferta (aprox)
        - ${students.filter((_, i) => [0, 1, 3].includes(i)).length} estudiantes con verificación académica`);

        return {
            success: true,
            data: {
                skills: skills.length,
                profamilies: profamilies.length,
                scenters: scenters.length,
                companies: companies.length,
                users: users.length,
                students: students.length,
                tutors: tutors.length,
                offers: offers.length,
                academicVerifications: 3 // estudiantes verificados
            }
        };

    } catch (error) {
        logger.error('❌ Error durante el seed de producción:', error);
        throw error;
    }
}

export default seedDatabase;
