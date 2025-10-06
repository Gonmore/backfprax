import jwt from 'jsonwebtoken';
import { User, Student, UserCompany, UserScenter, Scenter } from '../models/relations.js';
import { Op } from 'sequelize';
import logger from '../logs/logger.js';
import { comparar } from '../common/bcrypt.js';

class AuthController {
    async register(req, res) {
        try {
            const { username, email, password, role, name, surname, phone, description, countryCode, cityId, address, studentData, scenterId } = req.body;

            // Validaciones básicas
            if (!username || !email || !password || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos obligatorios faltantes: username, email, password, role'
                });
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email inválido'
                });
            }

            // Validar role
            const validRoles = ['student', 'company', 'scenter', 'tutor', 'admin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Role inválido. Debe ser: student, company, scenter, tutor, o admin'
                });
            }

            // Validar scenterId si el role es scenter
            if (role === 'scenter' && !scenterId) {
                return res.status(400).json({
                    success: false,
                    message: 'Para usuarios de centro educativo, se requiere seleccionar un centro educativo (scenterId)'
                });
            }

            // Verificar que el scenter existe si se proporciona
            if (role === 'scenter' && scenterId) {
                const scenter = await Scenter.findByPk(scenterId);
                if (!scenter) {
                    return res.status(400).json({
                        success: false,
                        message: 'El centro educativo seleccionado no existe'
                    });
                }
            }

            // Validar longitud de contraseña
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ email }, { username }]
                }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: existingUser.email === email ? 'El email ya está registrado' : 'El username ya está en uso'
                });
            }

            // Datos para crear usuario
            const userData = {
                username: username.trim(),
                email: email.toLowerCase().trim(),
                password, // El hook beforeCreate lo hasheará
                role,
                name: name?.trim() || null,
                surname: surname?.trim() || null,
                phone: phone?.trim() || null,
                description: description?.trim() || null,
                countryCode: countryCode?.trim() || null,
                cityId: cityId?.trim() || null,
                address: address?.trim() || null,
                active: true,
                status: 'active'
            };

            // Crear usuario
            const user = await User.create(userData);

            // Crear registro de estudiante si es necesario
            let student = null;
            if (role === 'student' && studentData) {
                try {
                    student = await Student.create({
                        userId: user.id,
                        grade: studentData.grade,
                        course: studentData.course,
                        car: studentData.car || false,
                        tag: studentData.tag,
                        description: studentData.description,
                        profamilyId: studentData.profamilyId,
                        active: true
                    });
                } catch (studentError) {
                    // Si falla la creación del estudiante, eliminar el usuario creado
                    await User.destroy({ where: { id: user.id } });
                    throw new Error('Error creando perfil de estudiante: ' + studentError.message);
                }
            }

            // Generar token
            const token = jwt.sign({
                userId: user.id,
                role: user.role,
                email: user.email,
                username: user.username
            }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    surname: user.surname,
                    phone: user.phone,
                    countryCode: user.countryCode,
                    cityId: user.cityId,
                    address: user.address,
                    needsOnboarding: true,
                    studentId: student?.id
                }
            });

        } catch (error) {
            console.error('❌ Error en registro:', error);

            // Manejar errores específicos de Sequelize
            if (error.name === 'SequelizeValidationError') {
                const messages = error.errors.map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: messages
                });
            }

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    success: false,
                    message: 'El usuario ya existe'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async login(req, res) {
        try {
            const { email, username, password } = req.body;

            // Validar que se proporcionen las credenciales
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña es requerida'
                });
            }

            const searchField = email || username;
            if (!searchField) {
                return res.status(400).json({
                    success: false,
                    message: 'Email o username es requerido'
                });
            }

            // Buscar usuario
            const user = await User.findOne({ 
                where: { 
                    [Op.or]: [
                        { email: searchField.toLowerCase() },
                        { username: searchField }
                    ]
                } 
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar que el usuario esté activo
            if (!user.active) {
                return res.status(401).json({
                    success: false,
                    message: 'Cuenta desactivada. Contacte al administrador.'
                });
            }

            // Verificar contraseña
            const isValidPassword = await comparar(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Obtener studentId si el usuario es estudiante
            let studentId = null;
            if (user.role === 'student') {
                const student = await Student.findOne({ where: { userId: user.id } });
                studentId = student?.id || null;
            }

            // Obtener companyId si el usuario es empresa
            let companyId = null;
            if (user.role === 'company') {
                const userCompany = await UserCompany.findOne({ where: { userId: user.id } });
                companyId = userCompany?.companyId || null;
            }

            // Obtener scenterId si el usuario es de centro educativo
            let scenterId = null;
            if (user.role === 'scenter') {
                const userScenter = await UserScenter.findOne({ 
                    where: { userId: user.id, isActive: true }
                });
                scenterId = userScenter?.scenterId || null;
            }

            // Generar token
            const token = jwt.sign({
                userId: user.id,
                role: user.role,
                email: user.email,
                username: user.username
            }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.json({
                success: true,
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    surname: user.surname,
                    phone: user.phone,
                    countryCode: user.countryCode,
                    cityId: user.cityId,
                    address: user.address,
                    studentId: studentId,
                    companyId: companyId,
                    scenterId: scenterId
                }
            });

        } catch (error) {
            console.error('❌ Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

// ⚠️ CAMBIAR LA EXPORTACIÓN
const authController = new AuthController();
export default authController;

// O alternativamente, exporta las funciones directamente:
// export const register = (req, res) => new AuthController().register(req, res);
// export const login = (req, res) => new AuthController().login(req, res);