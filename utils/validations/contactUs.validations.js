const { check,body} = require('express-validator');
const validator = require('../../middlewares/validator')
 

exports.contactFormValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address'),
  body('address').optional(), // Address is optional, no validation specified
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('company').optional(), // Company is optional, no validation specified
  body('message').notEmpty().withMessage('Message is required'),
  validator
];

exports.FormIdValidation = [
  check('id').notEmpty().withMessage('Form ID Is Required')
  .isMongoId().withMessage(`Invalid Mongo ID`),
  validator
];


 