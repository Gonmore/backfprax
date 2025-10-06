import { Token, TokenTransaction, Company, RevealedCV } from '../models/relations.js';
import sequelize from '../database/database.js';
import logger from '../logs/logger.js';

export class TokenService {
    
    // Obtener balance de tokens de una empresa
    static async getCompanyTokens(companyId) {
        try {
            let token = await Token.findOne({
                where: { companyId }
            });

            if (!token) {
                // Crear registro inicial con 10 tokens gratis
                token = await Token.create({
                    companyId: companyId,
                    amount: 10,
                    usedAmount: 0,
                    purchasedAmount: 10
                });
            }

            return {
                available: token.amount,
                used: token.usedAmount,
                total: token.purchasedAmount
            };
        } catch (error) {
            logger.error('Error getCompanyTokens:', error);
            throw error;
        }
    }

    // Verificar si un CV ya fue revelado
    static async isCVRevealed(companyId, studentId) {
        try {
            const revealed = await RevealedCV.findOne({
                where: {
                    companyId: companyId,
                    studentId: studentId
                }
            });
            return !!revealed;
        } catch (error) {
            logger.error('Error checking revealed CV:', error);
            throw error;
        }
    }

    // Usar tokens con persistencia para CVs revelados
    static async useTokens(companyId, amount, action, studentId = null, description = '') {
      try {
        console.log(`💳 Intentando usar ${amount} tokens para ${action}, estudiante: ${studentId}`);
        
        // 🔥 MAPEAR ACCIONES CORRECTAS PARA LA DB
        const actionMap = {
          'view_cv_ai': 'view_cv',
          'contact_student_ai': 'contact_student',
          'view_cv': 'view_cv',
          'contact_student': 'contact_student'
        };
        
        const dbAction = actionMap[action] || action;
        
        // 🔥 VERIFICAR SI EL CV YA FUE REVELADO (PERSISTENCIA)
        if (studentId && (action === 'view_cv_ai' || action === 'view_cv')) {
          const alreadyRevealed = await this.isCVRevealed(companyId, studentId);
          if (alreadyRevealed) {
            console.log(`✅ CV del estudiante ${studentId} ya fue revelado previamente - Acceso gratuito`);
            return { 
              wasAlreadyRevealed: true, 
              newBalance: null,
              message: 'CV ya revelado previamente'
            };
          }
        }

        // Obtener o crear registro de tokens de la empresa
        let tokenRecord = await Token.findOne({
          where: { companyId }
        });

        if (!tokenRecord) {
          // Crear registro inicial con tokens gratuitos
          tokenRecord = await Token.create({
            companyId: companyId,
            amount: 10, // Tokens iniciales gratuitos
            usedAmount: 0,
            purchasedAmount: 10
          });
          console.log(`🎁 Tokens iniciales creados para empresa ${companyId}`);
        }

        // 🔥 VERIFICAR BALANCE SUFICIENTE
        if (tokenRecord.amount < amount) {
          console.log(`❌ Tokens insuficientes. Requeridos: ${amount}, Disponibles: ${tokenRecord.amount}`);
          throw new Error('Tokens insuficientes');
        }

        // 🔥 DESCONTAR TOKENS INMEDIATAMENTE
        const newBalance = tokenRecord.amount - amount;
        const newUsedAmount = tokenRecord.usedAmount + amount;

        await tokenRecord.update({
          amount: newBalance,
          usedAmount: newUsedAmount
        });

        console.log(`💰 Tokens descontados: ${amount}. Nuevo balance: ${newBalance}`);

        // 🔥 REGISTRAR LA TRANSACCIÓN
        await TokenTransaction.create({
          companyId: companyId,
          studentId: studentId,
          type: 'usage',
          action: dbAction,
          amount: -amount, // Negativo porque es un gasto
          description: description || `Usar ${amount} tokens para ${dbAction}`,
          balanceAfter: newBalance
        });

        // 🔥 SI ES PARA VER CV, MARCAR COMO REVELADO PERMANENTEMENTE
        if (studentId && (action === 'view_cv_ai' || action === 'view_cv')) {
          await RevealedCV.create({
            companyId: companyId,
            studentId: studentId,
            tokensUsed: amount,
            revealType: 'intelligent_search',
            revealedAt: new Date()
          });
          console.log(`💾 CV del estudiante ${studentId} marcado como revelado para empresa ${companyId}`);
        }

        return { 
          wasAlreadyRevealed: false, 
          newBalance: newBalance,
          tokensUsed: amount,
          message: `${amount} tokens utilizados correctamente`
        };

      } catch (error) {
        console.error('❌ Error en useTokens:', error);
        throw error;
      }
    }

    // Comprar tokens
    static async purchaseTokens(companyId, amount, paymentInfo = {}) {
        const transaction = await sequelize.transaction();
        
        try {
            const tokenRecord = await this.getCompanyTokens(companyId);

            // Actualizar balance
            await tokenRecord.update({
                amount: tokenRecord.amount + amount,
                purchasedAmount: tokenRecord.purchasedAmount + amount,
                lastPurchaseDate: new Date()
            }, { transaction });

            // Registrar transacción
            await TokenTransaction.create({
                companyId,
                type: 'purchase',
                action: 'buy_tokens',
                amount: amount,
                description: `Compra de ${amount} tokens`,
                balanceAfter: tokenRecord.amount + amount
            }, { transaction });

            await transaction.commit();
            return tokenRecord.amount + amount; // Nuevo balance
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Obtener historial de transacciones
    static async getTransactionHistory(companyId, limit = 50) {
        try {
            return await TokenTransaction.findAll({
                where: { companyId },
                include: [
                    {
                        model: Student,
                        as: 'student',
                        required: false,
                        include: [
                            {
                                model: User,
                                attributes: ['name', 'surname', 'email']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit
            });
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            throw error;
        }
    }

    // Obtener CVs revelados por una empresa
    static async getRevealedCVs(companyId) {
        try {
            const revealedCVs = await RevealedCV.findAll({
                where: { companyId },
                attributes: ['studentId', 'revealedAt', 'tokensUsed'],
                order: [['revealedAt', 'DESC']]
            });

            return revealedCVs.map(cv => cv.studentId);
        } catch (error) {
            logger.error('Error getRevealedCVs:', error);
            throw error;
        }
    }
}