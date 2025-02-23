const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidationRules, loginValidationRules } = require('../validators/authValidator');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/users', authenticate, authorize(["Administrator"]), userController.getUsers);
router.post('/users/register', registerValidationRules(), userController.register);
router.post('/users/login', loginValidationRules(), userController.login);
// router.put('/users/:id', userController.updateUser);
// router.delete('/users/:id', userController.deleteUser);

module.exports = router;