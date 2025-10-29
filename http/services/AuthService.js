const { join } = require('path');
const { sign, verify } = require("jsonwebtoken");

const User = require('../../models/User');
const TokenBlacklist = require("../../models/TokenBlacklist");

const filePathname = require("../../enum/filePathname");
const fileFieldname = require("../../enum/fileFieldName");

const logger = require('../../logger');
const imageResizer = require("../../helper/imageResizer");
const { addTime, getPublicFilePath } = require("../../helper/helper");
const { token_expire, jwt_secret } = require("../../config/app");

class AuthService {
    async getTokenUser(token) {
        const { _id } = verify(token, jwt_secret);
        if(!_id) return null;
        const user = await User.findById(_id).select('+profile_picture').lean();

        if(!user) return null;
        return user;
    }

    async generateToken(user_id) {
        const token = sign({ _id: user_id }, jwt_secret, {
            expiresIn: token_expire,
        });
        await TokenBlacklist.create({ token, expire_at: addTime(token_expire) });

        return token;
    }

    async uploadProfilePicutre(file) {
        if (file && file.fieldname === fileFieldname.PROFILE_PICTURE) {
            const { filename, path: destination } = file;
            return await imageResizer(filename).catch(error => {
                const file_path = join(getPublicFilePath(filePathname.USER), filename);
                logger.error('Profile picture resize problem', {
                    file_path: destination,
                    error_message: error.message,
                    stack: error?.stack
                });
                return [file_path, ''];
            });
        } else {
            return ['', '']
        }
    }

    async userLogout(token) {
        const { _id } = verify(token, jwt_secret);
        if(!_id) return false;
        await TokenBlacklist.findOneAndUpdate({ token }, { blacklisted_at: Date.now()});

        return true;
    }
}

module.exports = new AuthService();