/**
 * @swagger
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       required:
 *         - name
 *         - location
 *         - mode
 *         - type
 *         - period
 *         - schedule
 *         - sector
 *         - tag
 *         - description
 *         - jobs
 *         - requisites
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la oferta
 *         name:
 *           type: string
 *           description: Nombre de la oferta
 *         location:
 *           type: string
 *           description: Ubicación de la oferta
 *         mode:
 *           type: string
 *           description: Modalidad (presencial, remoto, híbrido)
 *         type:
 *           type: string
 *           description: Tipo de oferta
 *         period:
 *           type: string
 *           description: Período de duración
 *         schedule:
 *           type: string
 *           description: Horario
 *         min_hr:
 *           type: integer
 *           description: Horas mínimas requeridas
 *           default: 200
 *         car:
 *           type: boolean
 *           description: Requiere vehículo propio
 *           default: false
 *         sector:
 *           type: string
 *           description: Sector empresarial
 *         tag:
 *           type: string
 *           description: Etiquetas descriptivas
 *         description:
 *           type: string
 *           description: Descripción detallada
 *         jobs:
 *           type: string
 *           description: Trabajos a realizar
 *         requisites:
 *           type: string
 *           description: Requisitos necesarios
 *         profamilyId:
 *           type: integer
 *           description: ID de la familia profesional
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Profamily:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la familia profesional
 *         name:
 *           type: string
 *           description: Nombre de la familia profesional
 *         description:
 *           type: string
 *           description: Descripción de la familia profesional
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Tutor:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del tutor (DNI, código, etc.)
 *         name:
 *           type: string
 *           description: Nombre del tutor
 *         email:
 *           type: string
 *           description: Email del tutor
 *         grade:
 *           type: string
 *           description: Grado académico
 *         degree:
 *           type: string
 *           description: Título profesional
 *         tutorId:
 *           type: integer
 *           description: ID del centro de estudios
 *         profamilyId:
 *           type: integer
 *           description: ID de la familia profesional
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Error:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           description: Mensaje de error
 *         message:
 *           type: string
 *           description: Mensaje de error (alternativo)
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Offers
 *     description: Gestión de ofertas de prácticas profesionales
 *   - name: Profamilies
 *     description: Gestión de familias profesionales
 *   - name: Tutors
 *     description: Gestión de tutores
 */

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Obtener todas las ofertas
 *     tags: [Offers]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de ofertas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offer'
 *       404:
 *         description: No hay ofertas disponibles
 *       500:
 *         description: Error interno del servidor
 *   
 *   post:
 *     summary: Crear una nueva oferta
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - mode
 *               - type
 *               - period
 *               - schedule
 *               - sector
 *               - tag
 *               - description
 *               - jobs
 *               - requisites
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               mode:
 *                 type: string
 *               type:
 *                 type: string
 *               period:
 *                 type: string
 *               schedule:
 *                 type: string
 *               min_hr:
 *                 type: integer
 *               car:
 *                 type: boolean
 *               sector:
 *                 type: string
 *               tag:
 *                 type: string
 *               description:
 *                 type: string
 *               jobs:
 *                 type: string
 *               requisites:
 *                 type: string
 *               profamilyId:
 *                 type: integer
 *               companyId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Oferta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/offers/{id}:
 *   get:
 *     summary: Obtener una oferta específica
 *     tags: [Offers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la oferta
 *     responses:
 *       200:
 *         description: Oferta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error del servidor
 *   
 *   put:
 *     summary: Actualizar una oferta
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la oferta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               mode:
 *                 type: string
 *               type:
 *                 type: string
 *               period:
 *                 type: string
 *               schedule:
 *                 type: string
 *               min_hr:
 *                 type: integer
 *               car:
 *                 type: boolean
 *               sector:
 *                 type: string
 *               tag:
 *                 type: string
 *               description:
 *                 type: string
 *               jobs:
 *                 type: string
 *               requisites:
 *                 type: string
 *               profamilyId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Oferta actualizada exitosamente
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error del servidor
 *   
 *   delete:
 *     summary: Eliminar una oferta
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la oferta
 *     responses:
 *       200:
 *         description: Oferta eliminada exitosamente
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/offers/company/{companyId}:
 *   get:
 *     summary: Obtener ofertas por empresa
 *     tags: [Offers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *     responses:
 *       200:
 *         description: Lista de ofertas de la empresa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offer'
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/offers/profamily/{profamilyId}:
 *   get:
 *     summary: Obtener ofertas por familia profesional
 *     tags: [Offers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: profamilyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la familia profesional
 *     responses:
 *       200:
 *         description: Lista de ofertas de la familia profesional
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offer'
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/profamilies:
 *   get:
 *     summary: Obtener todas las familias profesionales
 *     tags: [Profamilies]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de familias profesionales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profamily'
 *       404:
 *         description: No hay familias profesionales disponibles
 *       500:
 *         description: Error interno del servidor
 *   
 *   post:
 *     summary: Crear una nueva familia profesional
 *     tags: [Profamilies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Familia profesional creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profamily'
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/profamilies/{id}:
 *   get:
 *     summary: Obtener una familia profesional específica
 *     tags: [Profamilies]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la familia profesional
 *     responses:
 *       200:
 *         description: Familia profesional encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profamily'
 *       404:
 *         description: Familia profesional no encontrada
 *       500:
 *         description: Error del servidor
 *   
 *   put:
 *     summary: Actualizar una familia profesional
 *     tags: [Profamilies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la familia profesional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Familia profesional actualizada exitosamente
 *       404:
 *         description: Familia profesional no encontrada
 *       500:
 *         description: Error del servidor
 *   
 *   delete:
 *     summary: Eliminar una familia profesional
 *     tags: [Profamilies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la familia profesional
 *     responses:
 *       200:
 *         description: Familia profesional eliminada exitosamente
 *       404:
 *         description: Familia profesional no encontrada
 *       400:
 *         description: No se puede eliminar porque tiene registros asociados
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/profamilies/{id}/students:
 *   get:
 *     summary: Obtener estudiantes por familia profesional
 *     tags: [Profamilies]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la familia profesional
 *     responses:
 *       200:
 *         description: Lista de estudiantes de la familia profesional
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Familia profesional no encontrada
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/profamilies/{id}/tutors:
 *   get:
 *     summary: Obtener tutores por familia profesional
 *     tags: [Profamilies]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la familia profesional
 *     responses:
 *       200:
 *         description: Lista de tutores de la familia profesional
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tutor'
 *       404:
 *         description: Familia profesional no encontrada
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/tutors:
 *   get:
 *     summary: Obtener todos los tutores
 *     tags: [Tutors]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de tutores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tutor'
 *       404:
 *         description: No hay tutores disponibles
 *       500:
 *         description: Error interno del servidor
 *   
 *   post:
 *     summary: Crear un nuevo tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               grade:
 *                 type: string
 *               degree:
 *                 type: string
 *               scenterId:
 *                 type: integer
 *               profamilyId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tutor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/tutors/{id}:
 *   get:
 *     summary: Obtener un tutor específico
 *     tags: [Tutors]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tutor
 *     responses:
 *       200:
 *         description: Tutor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       404:
 *         description: Tutor no encontrado
 *       500:
 *         description: Error del servidor
 *   
 *   put:
 *     summary: Actualizar un tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tutor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               grade:
 *                 type: string
 *               degree:
 *                 type: string
 *               scenterId:
 *                 type: integer
 *               profamilyId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tutor actualizado exitosamente
 *       404:
 *         description: Tutor no encontrado
 *       500:
 *         description: Error del servidor
 *   
 *   delete:
 *     summary: Eliminar un tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tutor
 *     responses:
 *       200:
 *         description: Tutor eliminado exitosamente
 *       404:
 *         description: Tutor no encontrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/tutors/scenter/{scenterId}:
 *   get:
 *     summary: Obtener tutores por centro de estudios
 *     tags: [Tutors]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: scenterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del centro de estudios
 *     responses:
 *       200:
 *         description: Lista de tutores del centro de estudios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tutor'
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/tutors/profamily/{profamilyId}:
 *   get:
 *     summary: Obtener tutores por familia profesional
 *     tags: [Tutors]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: profamilyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la familia profesional
 *     responses:
 *       200:
 *         description: Lista de tutores de la familia profesional
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tutor'
 *       500:
 *         description: Error del servidor
 */
