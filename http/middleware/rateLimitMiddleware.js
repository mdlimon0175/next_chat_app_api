const { default: rateLimit } = require("express-rate-limit");
const { apiResponse } = require("../../helper/helper");

const authRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: apiResponse(false, 'Too many requests, please try again after 5 minutes.'),
    legacyHeaders: false,
    skipSuccessfulRequests: true
})

const messageStoreRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 15,
    message: apiResponse(false, 'Too many requests, please try again after 1 minute.'),
    legacyHeaders: false
})

const conversationStoreRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 5,
    message: apiResponse(false, 'Too many requests, please try again after 1 minute.'),
    legacyHeaders: false
})

const profileInfoChangeRateLimit = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 2,
    message: apiResponse(false, 'Too many requests, please try again after 30 minutes.'),
    legacyHeaders: false,
    skipSuccessfulRequests: true
})

const globalRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 60,
    message: apiResponse(false, 'Too many requests, please try again after 1 minute.'),
    legacyHeaders: false
})

module.exports = {
    authRateLimit,
    globalRateLimit,
    messageStoreRateLimit,
    conversationStoreRateLimit,
    profileInfoChangeRateLimit
}