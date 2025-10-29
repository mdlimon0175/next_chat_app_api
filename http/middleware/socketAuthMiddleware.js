const { JsonWebTokenError } = require('jsonwebtoken');
const AuthService = require('../../services/AuthService');

const { ApiError } = require('./errorMiddleware');
const errorMessage = require('../../enum/errorMessage');

async function socketAuthMiddleware(socket, next) {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new ApiError(401, errorMessage[401]));
    }

    try {
        const authService = new AuthService(token);
        const user = await authService.authenticate();

        socket.user = user;
        socket.join(user._id.toString());
        next();
    } catch(error) {
        const status = error instanceof JsonWebTokenError ? 401 : 500;
        next(new ApiError(status, errorMessage[status]));
    }
}

module.exports = socketAuthMiddleware;