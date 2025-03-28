const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidationRules, loginValidationRules } = require('../validators/authValidator');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/users', authenticate, authorize(["Admin"]), userController.getUsers);
router.post('/auth/register', registerValidationRules(), userController.register);
router.post('/auth/login', loginValidationRules(), userController.login);

module.exports = router;