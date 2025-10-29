const { check } = require("express-validator");
const User = require("../../models/User");

const profileInfoRequest = [
    check("username")
        .notEmpty()
        .withMessage((_, { path }) => `${path} is required`)
        .isString()
        .withMessage((_, { path }) => `${path} must be a string!`)
        .isLength({ min: 3 })
        .withMessage(
            (_, { path }) => `${path} must be at least 3 characters long!`
        )
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage((_, { path }) => `${path} can only contain letters, numbers, and underscores`)
        .trim()
        .custom(async (value, { req }) => {
            const user = await User.findOne({ 
                _id: { $ne: req.user._id },
                username: value 
            }).select('_id').lean();
            if (user) {
                throw new Error("username already in use");
            }
        }),
    check("email")
        .notEmpty()
        .withMessage((_, { path }) => `${path} is required`)
        .isEmail()
        .withMessage((_, { path }) => `${path} must be a valid email`)
        .toLowerCase()
        .trim()
        .custom(async (value, { req }) => {
            const user = await User.findOne({ 
                _id: { $ne: req.user._id },
                email: value 
            }).select('_id').lean();
            if (user) {
                throw new Error("username already in use");
            }
        }),
    check("password")
        .notEmpty()
        .withMessage((_, { path }) => `${path} is required`)
        .isString()
        .withMessage((_, { path }) => `${path} must be a string`)
        .isLength({ min: 6 })
        .withMessage(
            (_, { path }) => `${path} must be at least 6 characters long`
        ),
    check("password_confirmation")
        .notEmpty()
        .withMessage((_, { path }) => `${path} is required`)
        .isString()
        .withMessage((_, { path }) => `${path} must be a string`)
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password confirmation does not match!");
            }
            return true;
        })
];

module.exports = profileInfoRequest;