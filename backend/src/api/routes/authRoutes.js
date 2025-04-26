const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidationRules, loginValidationRules, sendInviteValidationRules, registerByInviteValidationRules } = require('../validators/authValidator');
const { authenticate, authorize } = require('../middlewares/auth');
const validateResult = require('../middlewares/validateResult');

router.get('/users', authenticate, authorize(["Admin"]), userController.getUsers);
router.post('/auth/register', registerValidationRules(), validateResult, userController.register);
router.post('/auth/register/invite', registerByInviteValidationRules(), validateResult, userController.registerByInvite);
router.post('/auth/login', loginValidationRules(), validateResult, userController.login);
router.post('/auth/sendInvite', authenticate, authorize(["Admin"]), sendInviteValidationRules(), validateResult, userController.sendInvite);

module.exports = router;