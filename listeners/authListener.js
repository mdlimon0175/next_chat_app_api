const AuthService = require('../services/AuthService');
const { ApiError } = require('../http/middleware/errorMiddleware');

function authListener(io, socket) {
    socket.on('auth_checker', async (token) => {
        try {
            const authService = new AuthService(token);
            await authService.authenticate();

            return socket.emit('auth_success');
        } catch(error) {
            return socket.emit('auth_failed', new ApiError(401, "Token expired!"));
        }
    });
}

module.exports = authListener;