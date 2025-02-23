const { body } = require('express-validator');

const registerValidationRules = () => {
    return [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
        body('role').isIn(['Administrator', 'Veterinarian', 'Client']).withMessage('Invalid role')
    ];
};

const loginValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').exists().withMessage('Password is required')
    ];
};

module.exports = {
    registerValidationRules,
    loginValidationRules,
};

