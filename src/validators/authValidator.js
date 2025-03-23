const { body } = require('express-validator');

const registerValidationRules = () => {
    return [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
        body('role').isIn(['Admin', 'Vet', 'Client']).withMessage('Invalid role')
    ];
};

const loginValidationRules = () => {
    return [
        body('username').exists().withMessage('Invalid username'),
        body('password').exists().withMessage('Invalid password')
    ];
};

module.exports = {
    registerValidationRules,
    loginValidationRules,
};