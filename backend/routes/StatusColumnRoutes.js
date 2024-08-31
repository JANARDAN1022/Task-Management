const router = require('express').Router();
const {authenticate,authenticatePermission} = require('../middleWares/Auth');
const {createStatus,UpdateStatus,GetAllStatus,DeleteStatusColumn} = require('../controllers/StatusColumnController');

router.route('/Create').post(authenticate,authenticatePermission,createStatus);
router.route('/Update').post(authenticate,authenticatePermission, UpdateStatus);
router.route('/All').post(authenticate,GetAllStatus);
router.route('/Delete').post(authenticate,authenticatePermission,DeleteStatusColumn);

module.exports = router;