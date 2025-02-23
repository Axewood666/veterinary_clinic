
const { body } = require('express-validator');

const petAddValidator = () => {
    return [
        body('name')
            .exists().withMessage('Name is required.')
            .isLength({ min: 1 }).withMessage('Name must be at least 1 character long.'),

        body('breed')
            .exists().withMessage('Breed is required.'),

        body('age')
            .isInt({ min: 0 }).withMessage('Age must be a non-negative integer.'),
    ];
};

module.exports = { petAddValidator };
