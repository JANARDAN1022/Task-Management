const router = require('express').Router();
const {authenticate,authenticatePermission} = require('../middleWares/Auth');
const {CreateTicket,UpdateTicket,GetAllTickets,GetSpecificTicket,GetParenTickets} = require('../controllers/ticketController');

router.route('/Create').post(authenticate,authenticatePermission,CreateTicket);
router.route('/Update').post(authenticate,authenticatePermission,UpdateTicket);
router.route('/Specific').post(authenticate, GetSpecificTicket);
router.route('/All').post(authenticate,GetAllTickets);
router.route('/All/Relation').post(authenticate,authenticatePermission,GetParenTickets);



module.exports = router;