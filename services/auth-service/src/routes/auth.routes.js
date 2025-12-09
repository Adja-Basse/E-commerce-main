const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const roleController = require('../controllers/role.controller');
const { authenticate } = require('../../../../shared/middleware/auth.middleware');
const {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateChangePassword,
  validateUpdateProfile
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', validateRegister, authController.register.bind(authController));
router.post('/login', validateLogin, authController.login.bind(authController));
router.post('/refresh', validateRefreshToken, authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.getProfile.bind(authController));
router.put('/profile', authenticate, validateUpdateProfile, authController.updateProfile.bind(authController));
router.put('/change-password', authenticate, validateChangePassword, authController.changePassword.bind(authController));
router.post('/logout-all', authenticate, authController.logoutAll.bind(authController));

// Role routes (protected)
router.get('/roles', authenticate, roleController.getAllRoles.bind(roleController));
router.get('/roles/:id', authenticate, roleController.getRoleById.bind(roleController));
router.post('/roles', authenticate, roleController.createRole.bind(roleController));
router.post('/roles/:roleId/assign', authenticate, roleController.assignRoleToUser.bind(roleController));
router.delete('/roles/:roleId/users/:userId', authenticate, roleController.removeRoleFromUser.bind(roleController));

module.exports = router;

