const slugify = require("slugify");
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validator");
const User = require("../../models/user.model");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User Name required")
    .isLength({ min: 3 })
    .withMessage("Name Too short ")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("lname")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Last Name Too short ")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("phone")
    .notEmpty()
    .withMessage("Mobile phone is required")
    .custom((val) =>
      User.findOne({ phone: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("This mobile phone allready used "));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),

  validatorMiddleware,
];

exports.loginValidator = [
  check("phone")
    .notEmpty()
    .withMessage("phone number required")
    .isMobilePhone()
    .withMessage("Invalid mobile phone number"),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
];

exports.resetePasswordValidator = [
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),

  validatorMiddleware,
];
