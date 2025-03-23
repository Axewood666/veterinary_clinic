const { body } = require('express-validator');

exports.validateAppointment = [
    body('petid')
        .notEmpty()
        .withMessage('Pet ID is required')
        .isInt()
        .withMessage('Pet ID must be a number'),

    body('vetid')
        .notEmpty()
        .withMessage('Vet ID is required')
        .isInt()
        .withMessage('Vet ID must be a number'),

    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Invalid date format'),

    body('comment')
        .notEmpty()
        .withMessage('Comment is required')
        .isString()
        .withMessage('Comment must be a string')
        .trim(),

    body('type')
        .notEmpty()
        .withMessage('Type is required')
        .isIn(['consultation', 'vaccination', 'other'])
        .withMessage('Type must be one of: consultation, surgery, vaccination, other')
];
