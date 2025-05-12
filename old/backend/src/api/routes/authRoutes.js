const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidationRules, loginValidationRules, sendInviteValidationRules, registerByInviteValidationRules } = require('../validators/authValidator');
const { isAuthenticated, authorize } = require('../middlewares/authMiddleware');
const validateResult = require('../middlewares/validateResult');

router.get('/users', isAuthenticated, authorize(["admin"]), userController.getUsers);
router.get('/me', isAuthenticated, userController.getTokenData);
router.post('/register', registerValidationRules(), validateResult, userController.register);
router.post('/register/invite', registerByInviteValidationRules(), validateResult, userController.registerByInvite);
router.post('/login', loginValidationRules(), validateResult, userController.login);
router.post('/logout', isAuthenticated, userController.logout);
router.post('/sendInvite', isAuthenticated, authorize(["admin"]), sendInviteValidationRules(), validateResult, userController.sendInvite);
router.post('/ban-user', isAuthenticated, authorize(["admin"]), userController.banUser);

module.exports = router;