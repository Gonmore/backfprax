// userScenterController.js
import { UserScenter } from '../models/relations.js';

export const createUserScenter = async (req, res) => {
  try {
    const { userId, scenterId } = req.body;
    if (!userId || !scenterId) {
      return res.status(400).json({ message: 'userId y scenterId son requeridos' });
    }

    // Verificar si ya existe la relación activa
    const existing = await UserScenter.findOne({
      where: { userId, scenterId, isActive: true }
    });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'La relación ya existe',
        userScenter: existing
      });
    }

    // Crear la relación
    const userScenter = await UserScenter.create({
      userId,
      scenterId,
      isActive: true,
      assignedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Relación creada exitosamente',
      userScenter
    });
  } catch (error) {
    console.error('Error creando UserScenter:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export const getUserScentersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId es requerido'
      });
    }

    const userScenters = await UserScenter.findAll({
      where: { userId, isActive: true },
      include: [{ model: Scenter, as: 'scenter' }]
    });

    return res.status(200).json({
      success: true,
      data: userScenters
    });
  } catch (error) {
    console.error('Error obteniendo centros del usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};