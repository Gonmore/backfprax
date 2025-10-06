import logger from '../logs/logger.js';
import { Status } from '../constants/index.js';
import { User } from '../models/relations.js';

// Función auxiliar para obtener datos de ubicación de GeoNames
const getLocationData = async (countryCode, cityId) => {
    try {
        const geonamesUsername = process.env.GEONAMES_USERNAME;
        const geonamesBaseUrl = process.env.GEONAMES_BASE_URL || 'http://api.geonames.org';
        
        let locationData = {
            countryName: null,
            cityName: null
        };

        // Obtener nombre del país
        if (countryCode) {
            try {
                const countryUrl = `${geonamesBaseUrl}/countryInfoJSON?username=${geonamesUsername}&country=${countryCode}`;
                const countryResponse = await fetch(countryUrl);
                const countryData = await countryResponse.json();
                
                if (countryData.geonames && countryData.geonames.length > 0) {
                    locationData.countryName = countryData.geonames[0].countryName;
                }
            } catch (error) {
                logger.warn(`Error fetching country data for ${countryCode}:`, error.message);
            }
        }

        // Obtener nombre de la ciudad
        if (cityId) {
            try {
                const cityUrl = `${geonamesBaseUrl}/getJSON?username=${geonamesUsername}&geonameId=${cityId}`;
                const cityResponse = await fetch(cityUrl);
                const cityData = await cityResponse.json();
                
                if (cityData.name) {
                    locationData.cityName = cityData.name;
                    // Si no obtuvimos el país antes, usar el de la ciudad
                    if (!locationData.countryName && cityData.countryName) {
                        locationData.countryName = cityData.countryName;
                    }
                }
            } catch (error) {
                logger.warn(`Error fetching city data for ${cityId}:`, error.message);
            }
        }

        return locationData;
    } catch (error) {
        logger.error('Error in getLocationData:', error);
        return {
            countryName: null,
            cityName: null
        };
    }
};

// Obtener perfil completo del usuario
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        logger.info(`👤 Fetching complete profile for user: ${userId}`);

        // Buscar usuario básico
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // 🔥 OBTENER DATOS DE UBICACIÓN DE GEONAMES
        const locationData = await getLocationData(user.countryCode, user.cityId);

        // 🔥 CONSTRUIR PERFIL COMPLETO CON DATOS DE UBICACIÓN
        const profile = {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            // 🆕 DATOS DE UBICACIÓN DETALLADOS
            location: {
                countryCode: user.countryCode,
                countryName: locationData.countryName,
                cityId: user.cityId,
                cityName: locationData.cityName,
                // Dirección completa construida
                fullAddress: buildFullAddress(locationData.cityName, locationData.countryName)
            },
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        logger.info(`✅ Profile fetched for user ${userId}:`, {
            name: profile.name,
            phone: profile.phone,
            location: profile.location
        });

        res.json({
            success: true,
            profile
        });

    } catch (error) {
        logger.error('❌ Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil del usuario'
        });
    }
};

// Función auxiliar para construir dirección completa
function buildFullAddress(cityName, countryName) {
    const parts = [];
    
    if (cityName) {
        parts.push(cityName);
    }
    
    if (countryName) {
        parts.push(countryName);
    }
    
    return parts.length > 0 ? parts.join(', ') : null;
}

// Actualizar perfil del usuario
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, phone, countryCode, cityId } = req.body;

        logger.info(`🔄 Updating profile for user ${userId}:`, {
            name, phone, countryCode, cityId
        });

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Actualizar campos
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (countryCode !== undefined) updateData.countryCode = countryCode;
        if (cityId !== undefined) updateData.cityId = cityId;

        await user.update(updateData);

        // Obtener datos de ubicación actualizados
        const locationData = await getLocationData(
            updateData.countryCode || user.countryCode, 
            updateData.cityId || user.cityId
        );

        const updatedUser = await User.findByPk(userId);

        const profile = {
            id: updatedUser.id,
            username: updatedUser.username,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            location: {
                countryCode: updatedUser.countryCode,
                countryName: locationData.countryName,
                cityId: updatedUser.cityId,
                cityName: locationData.cityName,
                fullAddress: buildFullAddress(locationData.cityName, locationData.countryName)
            }
        };

        logger.info(`✅ Profile updated for user ${userId}`);

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            profile
        });

    } catch (error) {
        logger.error('❌ Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil del usuario'
        });
    }
};

async function getUsers(req, res) {
    try
        {const users = await User.findAll({
            attributes: ['id', 'username', 'status'],
            order: [['id', 'DESC']],
            where: {
                status: Status.ACTIVE,
            }
        }
        )
        res.json(users);}
    catch (error){
        logger.error('Error getUsers: '+ error)
        res.status(500).json ({message: 'server error'});
    }
}

async function createUsers(req, res){
    console.log(req.body)
    try{
        const { username,password} = req.body;
        const user = await User.create({username, password});
        res.json(user);
    } catch (error){
        logger.error('Error createUsers: '+ error);
        res.status(500).json({message: 'server error'});
    }
}

async function getUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id,{
            attributes: ['username','status']
        });
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.json(user);

    }catch(error){
        logger.error('Error getUser: ', +error);
        res.status(500).json({message: 'Server error'});

    }
}

async function updateUser(req, res) {
    const {id} = req.params;
    const {username, password} = req.body;
    try {
        if(!username || !password) {
            return res 
            .status(400)
            .json({message:'Username and password are required'});
        }
        const user = await User.update(
            {
                username: username,
                password: password,
            },
            {
                where: {
                    id: id,
                },
            }
        );       
    }catch(error){
        logger.error('Error updateUser: ', +error);
        res.status(500).json({message: 'Server error'});

    }
}

async function activateInactivate(req, res) {
    const {id} = req.params;
    const {status} = req.body;
    try {
        if(!status)   return res.status(400).json({message:'Status is required'});
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        if (user.status === status){
            return res
                .status(400).json({message: 'User already activated'});
        }
    
        user.status = status;
        await user.save();
        res.json(user);
            
    }catch(error){
        logger.error('Error activateInactivate: '+error);
        res.status(500).json({message: 'Server error'});
    }
}

async function deleteUser(req,res){
    const {id} = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
    
        await user.destroy();
        res.json({message: 'User deleted successfully'});
            
    }catch(error){
        logger.error('Error deleteUser: '+error);
        res.status(500).json({message: 'Server error'});
    }
}

export default {
    getUsers,
    createUsers,
    getUser,
    updateUser,
    activateInactivate,
    deleteUser,
    getUserProfile,      // 🆕 AGREGAR
    updateUserProfile    // 🆕 AGREGAR

}