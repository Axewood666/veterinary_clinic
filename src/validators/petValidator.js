
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

        body('gender')
            .isIn(['male', 'female']).withMessage('Gender must be either "male" or "female".'),

        body('type')
            .isIn(['dog', 'cat', 'bird', 'fish', 'other']).withMessage('Type must be one of: dog, cat, bird, fish, other.'),
    ];
};

module.exports = { petAddValidator };
