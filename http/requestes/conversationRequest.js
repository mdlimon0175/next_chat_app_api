const { check } = require("express-validator");
const User = require("../../models/User");

const conversationRequest = [
    check("receiver_id")
        .custom(async (value) => {
            const user = await User.findById(value);
            if (!user) {
                throw new Error("Receiver not found!");
            }
        }),
    check("message")
        .notEmpty()
        .withMessage((_, { path }) => `${path} is required`)
        .isString()
        .withMessage((_, { path }) => `${path} must be a string!`)
];

module.exports = conversationRequest;
