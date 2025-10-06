import { Router } from 'express';
import { 
    getAllCountries, 
    detectCountryByPhone, 
    getCitiesByCountry, 
    searchCitiesGlobal 
} from '../controllers/geographyController.js';

const router = Router();

router.get('/countries', getAllCountries);
router.get('/detect-country', detectCountryByPhone);
router.get('/countries/:countryCode/cities', getCitiesByCountry);
router.get('/cities/search', searchCitiesGlobal);

export default router;