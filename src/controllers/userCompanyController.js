// Obtener empresas asociadas a un usuario
export const getUserCompaniesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'userId es requerido' });
    }
    const userCompanies = await UserCompany.findAll({
      where: { userId, isActive: true }
    });
    return res.status(200).json(userCompanies);
  } catch (error) {
    console.error('Error obteniendo empresas del usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};
// userCompanyController.js
import { UserCompany } from '../models/relations.js';

export const createUserCompany = async (req, res) => {
  try {
  const { userId, companyId, role } = req.body;
    if (!userId || !companyId) {
      return res.status(400).json({ message: 'userId y companyId son requeridos' });
    }
    // Verificar si ya existe la relación activa
    const existing = await UserCompany.findOne({
      where: { userId, companyId, isActive: true }
    });
    if (existing) {
      return res.status(200).json({ message: 'La relación ya existe', userCompany: existing });
    }
    // Crear la relación
    // Usar 'owner' como valor por defecto para el campo role
      const validRoles = ['admin', 'manager', 'hr', 'viewer'];
      const assignedRole = validRoles.includes(role) ? role : 'admin';
      const userCompany = await UserCompany.create({
        userId,
        companyId,
        isActive: true,
        role: assignedRole
    });
    return res.status(201).json({ message: 'Relación creada', userCompany });
  } catch (error) {
    console.error('Error creando UserCompany:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};
