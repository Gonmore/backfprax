import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import scenterUserController from '../controllers/scenterUserController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuración de multer para uploads de Excel
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'excel');
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'students-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel.sheet.macroEnabled.12'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos Excel (.xls, .xlsx, .xlsm)'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB máximo
    }
});

// Todas las rutas requieren autenticación y verificación de usuario scenter
router.use(authenticateJWT);
router.use(scenterUserController.verifyScenterUser);

// Rutas para gestión del scenter
router.get('/info', scenterUserController.getScenterInfo);
router.put('/info', scenterUserController.updateScenterInfo);

// Rutas para gestión de familias profesionales
router.post('/profamilys', scenterUserController.addProfamilyToScenter);
router.get('/profamilys', scenterUserController.getScenterProfamilys);

// Rutas para gestión de estudiantes
router.post('/students', scenterUserController.addVerifiedStudent);
router.post('/students/bulk', upload.single('excelFile'), scenterUserController.bulkAddVerifiedStudents);
router.get('/students', scenterUserController.getScenterStudents);
router.put('/students/assign-tutor', scenterUserController.assignTutorToStudent);

// Rutas para estadísticas
router.get('/stats', scenterUserController.getScenterStats);

export default router;