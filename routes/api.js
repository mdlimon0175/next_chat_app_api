const multer = require('multer');
const express = require('express');

const { asyncHandler } = require('../helper/helper');

const authMiddleware = require('../http/middleware/authMiddleware');

const AuthController = require('../http/controllers/AuthController');
const UserController = require('../http/controllers/UserController');
const MessageController = require('../http/controllers/MessageController');
const ConversationController = require('../http/controllers/ConversationController');

const loginRequest = require('../http/requestes/loginRequest');
const registrationRequest = require('../http/requestes/registrationRequest');
const conversationRequest = require('../http/requestes/conversationRequest');
const profileInfoRequest = require('../http/requestes/profileInfoRequest');

// we moved vercel to render.com. render have some limit for file upload on free service.
// const profilePictureRequest = require('../http/requestes/fileRequest/profilePictureRequest');
const requestValidationMiddleware = require('../http/middleware/requestValidationMiddleware');
const checkProfileUpdatePermission = require('../http/middleware/checkProfileUpdatePermission');
const { 
    authRateLimit,
    profileInfoChangeRateLimit,
    conversationStoreRateLimit,
    messageStoreRateLimit 
} = require('../http/middleware/rateLimitMiddleware');
const requestMongoIdValidation = require('../http/middleware/requestMongoIdValidation');

// router object
const publicRouter = express.Router({ caseSensitive: true });
const privateRouter = express.Router({ caseSensitive: true });

// helper function for privateRouter
function privateRoute(method, path, ...handlers) {
    return privateRouter[method](path, asyncHandler(authMiddleware), ...handlers);
}

// public rotues //
publicRouter.post('/login', [
    authRateLimit,
    multer().none(),
    loginRequest,
    requestValidationMiddleware,
    asyncHandler(AuthController.login)
]);
publicRouter.post('/registration', [
    authRateLimit,
    // profilePictureRequest,
    multer().none(),
    registrationRequest,
    requestValidationMiddleware,
    asyncHandler(AuthController.registration)
]);

// private auth routes //
// user routes
privateRoute('get', '/logout', asyncHandler(AuthController.logout))
privateRoute('get', '/token_user', asyncHandler(AuthController.tokenUser));
privateRoute('get', '/users/:search', asyncHandler(UserController.getUser));
privateRoute('put', '/users/:user_id/change_profile_info', [
    profileInfoChangeRateLimit,
    requestMongoIdValidation('user_id'),
    asyncHandler(checkProfileUpdatePermission),
    // profilePictureRequest,
    multer().none(),
    profileInfoRequest,
    requestValidationMiddleware,
    asyncHandler(UserController.changeProfileInfo)
]);

// conversations routes
privateRoute('get', '/conversations', asyncHandler(ConversationController.index));
privateRoute('get', '/conversations/:conversation_id', [
    requestMongoIdValidation('conversation_id'),
    asyncHandler(ConversationController.show)
]);
privateRoute('post', '/conversations', [
    conversationStoreRateLimit,
    multer().none(),
    conversationRequest,
    requestValidationMiddleware,
    asyncHandler(ConversationController.store)
]);

// messages routes
privateRoute('get', '/messages/c/:conversation_id', [
    requestMongoIdValidation('conversation_id'),
    asyncHandler(MessageController.index)
]);
privateRoute('post', '/messages/c/:conversation_id', [
    messageStoreRateLimit,
    requestMongoIdValidation('conversation_id'),
    multer().none(),
    conversationRequest,
    requestValidationMiddleware,
    asyncHandler(MessageController.store)
]);

module.exports = {
    publicRouter,
    privateRouter
};