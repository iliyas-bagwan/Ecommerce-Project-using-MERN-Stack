const express = require('express')
const { registerUSer, loginUser, logOut, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController')
const router = express.Router()
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');



router.route("/register").post(registerUSer);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logOut);

router.route("/me").get(isAuthenticatedUser, getUserDetails)

router.route("/password/update").put(isAuthenticatedUser, updatePassword)

router.route("/me/update").put(isAuthenticatedUser, updateProfile)

router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers)

router.route("/admin/user/:id")
.get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
.put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
.delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser)



module.exports = router;