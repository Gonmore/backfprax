import { parsePhoneNumber, getCountries as getPhoneCountries, getCountryCallingCode } from 'libphonenumber-js';
import { getData } from 'country-list';
import logger from '../logs/logger.js';

// Validar variables de entorno al importar
const validateEnvironment = () => {
    const requiredVars = ['GEONAMES_USERNAME'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        logger.error(`Missing required environment variables: ${missing.join(', ')}`);
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    logger.info(`GeoNames configured with username: ${process.env.GEONAMES_USERNAME}`);
};

// Validar al importar
validateEnvironment();

// ✅ FUNCIONES RENOMBRADAS
export const getAllCountries = async (req, res) => {
    try {
        const countryData = getData();
        const phoneCountries = getPhoneCountries();
        
        const countries = countryData.map(country => {
            const hasPhone = phoneCountries.includes(country.code);
            let phonePrefix = null;
            
            if (hasPhone) {
                try {
                    phonePrefix = `+${getCountryCallingCode(country.code)}`;
                } catch (e) {
                    // Algunos países no tienen código telefónico
                }
            }
            
            return {
                code: country.code,
                name: country.name,
                phonePrefix,
                hasPhone
            };
        }).filter(country => country.hasPhone);
        
        res.json({
            success: true,
            data: countries,
            total: countries.length
        });
    } catch (error) {
        logger.error('Error getting countries:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener países'
        });
    }
};

export const detectCountryByPhone = async (req, res) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Número de teléfono requerido'
            });
        }

        try {
            const phoneNumber = parsePhoneNumber(phone);
            
            if (phoneNumber && phoneNumber.country) {
                const countryData = getData();
                const country = countryData.find(c => c.code === phoneNumber.country);
                
                if (country) {
                    return res.json({
                        success: true,
                        data: {
                            country: {
                                code: country.code,
                                name: country.name,
                                phonePrefix: `+${phoneNumber.countryCallingCode}`
                            },
                            phoneDetails: {
                                isValid: phoneNumber.isValid(),
                                formatted: phoneNumber.formatInternational(),
                                nationalFormat: phoneNumber.formatNational(),
                                type: phoneNumber.getType()
                            }
                        }
                    });
                }
            }

            res.json({
                success: true,
                data: {
                    country: null,
                    phoneDetails: {
                        isValid: false,
                        formatted: phone,
                        error: 'No se pudo detectar el país'
                    }
                }
            });

        } catch (parseError) {
            logger.warn('Error parsing phone number:', parseError);
            res.json({
                success: true,
                data: {
                    country: null,
                    phoneDetails: {
                        isValid: false,
                        formatted: phone,
                        error: 'Formato de teléfono inválido'
                    }
                }
            });
        }
    } catch (error) {
        logger.error('Error detecting country by phone:', error);
        res.status(500).json({
            success: false,
            message: 'Error al detectar país'
        });
    }
};

export const getCitiesByCountry = async (req, res) => {
    try {
        const { countryCode } = req.params;
        const { search, limit = 50 } = req.query;

        logger.info(`Fetching cities for country: ${countryCode}`);
        
        // Usar variables de entorno
        const geonamesUsername = process.env.GEONAMES_USERNAME;
        const geonamesBaseUrl = process.env.GEONAMES_BASE_URL || 'http://api.geonames.org';
        
        let url = `${geonamesBaseUrl}/searchJSON?username=${geonamesUsername}&country=${countryCode}&featureClass=P&maxRows=${limit}&orderby=population`;
        
        if (search && search.length >= 2) {
            url += `&name_startsWith=${encodeURIComponent(search)}`;
        }

        logger.info(`GeoNames URL: ${url.replace(geonamesUsername, '[USERNAME]')}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'FPRAX-App/1.0',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status) {
            logger.error('GeoNames API error:', data.status);
            return res.status(400).json({
                success: false,
                message: `Error de GeoNames: ${data.status.message}`,
                geonamesError: data.status
            });
        }

        if (!data.geonames || !Array.isArray(data.geonames)) {
            return res.json({
                success: true,
                data: [],
                total: 0,
                message: `No se encontraron ciudades para el país ${countryCode}`
            });
        }

        const cities = data.geonames.map(city => ({
            id: city.geonameId.toString(),
            name: city.name,
            state: city.adminName1 || null,
            country: {
                code: city.countryCode,
                name: city.countryName
            },
            population: parseInt(city.population) || 0,
            latitude: parseFloat(city.lat),
            longitude: parseFloat(city.lng),
            isCapital: city.fcl === 'A' && city.fcode === 'PPLC'
        }));

        logger.info(`Successfully found ${cities.length} cities for ${countryCode}`);

        res.json({
            success: true,
            data: cities,
            total: cities.length,
            source: 'GeoNames API',
            countryCode: countryCode
        });

    } catch (error) {
        logger.error('Error getting cities by country:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Error al obtener ciudades del país',
            error: error.message
        });
    }
};

export const searchCitiesGlobal = async (req, res) => {
    try {
        const { search, country, limit = 20 } = req.query;

        if (!search || search.length < 2) {
            return res.json({
                success: true,
                data: [],
                message: 'Mínimo 2 caracteres para buscar'
            });
        }

        const geonamesUsername = process.env.GEONAMES_USERNAME;
        const geonamesBaseUrl = process.env.GEONAMES_BASE_URL || 'http://api.geonames.org';
        
        let url = `${geonamesBaseUrl}/searchJSON?username=${geonamesUsername}&featureClass=P&maxRows=${limit}&orderby=population&name_startsWith=${encodeURIComponent(search)}`;
        
        if (country) {
            url += `&country=${country}`;
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'FPRAX-App/1.0',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status) {
            return res.status(400).json({
                success: false,
                message: data.status.message || 'Error en GeoNames API',
                geonamesError: data.status
            });
        }

        const cities = data.geonames?.map(city => ({
            id: city.geonameId.toString(),
            name: city.name,
            state: city.adminName1 || null,
            country: {
                code: city.countryCode,
                name: city.countryName
            },
            population: parseInt(city.population) || 0,
            latitude: parseFloat(city.lat),
            longitude: parseFloat(city.lng),
            isCapital: city.fcl === 'A' && city.fcode === 'PPLC'
        })) || [];

        res.json({
            success: true,
            data: cities,
            total: cities.length,
            source: 'GeoNames API',
            searchTerm: search
        });

    } catch (error) {
        logger.error('Error searching cities globally:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error al buscar ciudades',
            error: error.message
        });
    }
};