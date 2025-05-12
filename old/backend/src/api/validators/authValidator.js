const { body } = require('express-validator');

const registerValidationRules = () => {
    return [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    ];
};

const loginValidationRules = () => {
    return [
        body('username').exists().withMessage('Invalid username'),
        body('password').exists().withMessage('Invalid password')
    ];
};

const sendInviteValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Invalid email address'),
        body('role').isIn(['Vet', 'Manager', 'Admin']).withMessage('Invalid role')
    ];
};

const registerByInviteValidationRules = () => {
    return [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
        body('token').exists().withMessage('Invalid token')
    ]
}

module.exports = {
    registerValidationRules,
    loginValidationRules,
    sendInviteValidationRules,
    registerByInviteValidationRules
};