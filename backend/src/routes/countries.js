const router = require('express').Router();
const { getAllCountries, detectCountry } = require('../controllers/countryController');

router.get('/', getAllCountries);
router.get('/detect', detectCountry);

module.exports = router;
