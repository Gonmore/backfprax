import { Router } from 'express'
import userController from '../controllers/userController.js'
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();
router.route('/').get(userController.getUsers).post(userController.createUsers)

router.route('/:id').get(authenticateJWT, userController.getUser)
                    .put(authenticateJWT, userController.updateUser)
                    .patch(authenticateJWT, userController.activateInactivate)
                    .delete(authenticateJWT, userController.deleteUser)

   // 🆕 NUEVAS RUTAS PARA PERFIL CON UBICACIÓN
router.get('/profile/me', authenticateJWT, userController.getUserProfile);     // GET /api/users/profile/me
router.put('/profile/me', authenticateJWT, userController.updateUserProfile);  // PUT /api/users/profile/me
                 
export default router;