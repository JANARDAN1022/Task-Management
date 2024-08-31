const router = require('express').Router();
const {authenticate,authenticatePermission} = require('../middleWares/Auth');
const {GetSpecificTickethistory,GetSpecificProjectHistory,GetSpecificColumnHistory} = require('../controllers/historyController');

router.route('/ticket/specific').post(authenticate,authenticatePermission,GetSpecificTickethistory);
router.route('/project/specific').post(authenticate,authenticatePermission,GetSpecificProjectHistory);
router.route('/column/specific').post(authenticate,authenticatePermission,GetSpecificColumnHistory);

module.exports = router;