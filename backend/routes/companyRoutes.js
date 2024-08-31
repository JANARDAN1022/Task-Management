const router = require('express').Router();
const {authenticate} = require('../middleWares/Auth');
const {CreateCompany,getYourCompanies,UpdateCompany,deleteYourComapny,getAllJoinedCompanies,getSpecificCompany} = require('../controllers/companyController');

router.route('/create').post(authenticate,CreateCompany);
router.route('/yourCompanies').post(authenticate,getYourCompanies);
router.route('/yourCompanies/delete').post(authenticate,deleteYourComapny);
router.route('/yourCompanies/Specific').post(authenticate,getSpecificCompany);
router.route('/joinedCompanies').post(authenticate,getAllJoinedCompanies);
module.exports = router;