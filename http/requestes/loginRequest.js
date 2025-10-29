const { check } = require("express-validator");

const loginRequest = [
    check("email")
        .notEmpty()
        .withMessage((_, { path }) => `${path} is required`)
        .isEmail()
        .withMessage((_, { path }) => `${path} must be a valid email`)
        .toLowerCase(),
    check("password")
        .notEmpty()
        .withMessage((_, { path }) => `${path} is required`)
        .isString()
        .withMessage((_, { path }) => `${path} must be a string`)
        .notEmpty()
        .withMessage((_, { path }) => `${path} is required!`)
];

module.exports = loginRequest;
