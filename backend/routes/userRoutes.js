const router = require("express").Router();
const { authenticate, authenticatePermission } = require("../middleWares/Auth");
const {
  loginUser,
  logout,
  registerUser,
  LoadUser,
  getAllUsersWithProjectAccess,
  forgotPassword,
  resetPassword,
  validateToken,
  sendOTP,
  validateOTP,
  OtpExists,
  UpdateUserProfile
} = require("../controllers/userController");

router.route("/register").post(registerUser);
router.route("/logIn").post(loginUser);
router.route("/logout").post(authenticate, logout);
router.route("/Me").post(authenticate, LoadUser);
router.route("/All").post(authenticate, authenticatePermission, getAllUsersWithProjectAccess);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/token/validate").post(validateToken);
router.route("/password/reset").post(resetPassword);
router.route("/OTP/send").post(sendOTP);
router.route("/OTP/check").post(OtpExists);
router.route("/OTP/validate").post(validateOTP);
router.route("/update").post(authenticate,UpdateUserProfile);

module.exports = router;
