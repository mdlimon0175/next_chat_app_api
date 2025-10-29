const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");

const { verify } = require("jsonwebtoken");
const { jwt_secret } = require("../config/app");
const errorMessage = require("../enum/errorMessage");
const { ApiError } = require("../http/middleware/errorMiddleware");

class AuthService {
    constructor(token) {
        this.token = token;
    }

    async isTokenBlacklisted() {
        const blacklistedToken = await TokenBlacklist.findOne({ 
            token: this.token, 
            blacklisted_at: { $ne: null }
        }).select('_id').lean();

        return !!blacklistedToken;
    }

    async getTokenUser() {
        const { _id } = verify(this.token, jwt_secret);
        const user = await User.findById(_id).select('+profile_picture').lean();
        return user;
    }

    async authenticate() {
        try {
            const blacklistedToken = await this.isTokenBlacklisted();
            if (blacklistedToken) {
                this.throwAuthError();
            }

            // Validate the user from the token
            const user = await this.getTokenUser();
            if (!user) {
                this.throwAuthError();
            }

            return user;
        } catch (error) {
            this.throwAuthError(error.message || "Token expired!");
        }
    }

    throwAuthError(message = errorMessage[401]) {
        throw new ApiError(401, message);
    }
}

module.exports = AuthService;