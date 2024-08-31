const router = require('express').Router();
const {authenticate,authenticatePermission} = require('../middleWares/Auth');
const {CreateProject,DeleteProject,UpdateProject,getAllProjects,getSpecificProject} = require('../controllers/projectController');

router.route('/Create').post(authenticate,authenticatePermission,CreateProject);
router.route('/Update').post(authenticate,authenticatePermission,UpdateProject);
router.route('/Delete').post(authenticate,authenticatePermission,DeleteProject);
router.route('/Specific').post(authenticate,getSpecificProject);
router.route('/All').post(authenticate,getAllProjects);


module.exports = router;