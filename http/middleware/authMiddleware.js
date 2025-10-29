const AuthService = require('../../services/AuthService');

const { apiResponse } = require('../../helper/helper');
const errorMessage = require('../../enum/errorMessage');

async function authMiddleware(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json(apiResponse(false, errorMessage[401]));
    }

    const authService = new AuthService(token);
    const blacklistedToken = await authService.isTokenBlacklisted();
    if (blacklistedToken) {
        return res.status(401).json(apiResponse(false, errorMessage[401]));
    }

    const user = await authService.getTokenUser();
    if(!user) {
        return res.status(404).json(apiResponse(false, "User not found!"));
    }

    req.user = user;
    next();
}

module.exports = authMiddleware;