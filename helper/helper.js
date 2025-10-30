const { join } = require("path");

const logger = require("../logger");
const { app_url, isProduction } = require("../config/app");
const { existsSync } = require("fs");

function apiResponse(status = true, message = "", data = null, error = null) {
    return {
        status,
        message,
        data,
        error
    }
}

function getPublicPath() {
    /**
     * @note vercel avoid express.static to serve public files.
     */
    const public_path = isProduction ? join('..', 'public') : join(__dirname, '..', 'public');
    return public_path;
}

function getPublicFilePath(pathname) {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    return join('uploads', `${year}`, `${month}`, pathname);
}

function formatFileSize(bytes) {
    const sizes = ['bytes', 'kb', 'mb'];
    if (bytes === 0) return '0 bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return `${Math.round(bytes / Math.pow(1024, i) * 100)/100} ${sizes[i]}`;
}

function generateRandStr(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }
    return randomString;
}

function addTime(time) {
    const currentDate = new Date();
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1), 10);

    if (isNaN(value)) {
        throw new Error("Invalid parameter: Provide a number followed by 's', 'm', 'h', or 'd'");
    }

    switch (unit) {
        case 's':
            currentDate.setSeconds(currentDate.getSeconds() + value);
            break;
        case 'm':
            currentDate.setMinutes(currentDate.getMinutes() + value);
            break;
        case 'h':
            currentDate.setHours(currentDate.getHours() + value);
            break;
        case 'd':
            currentDate.setDate(currentDate.getDate() + value);
            break;
        default:
            logger.error(`Invalid time - ${time}`);
            break;
    }

    return currentDate;
}

function transformError(originalError) {
    const transformedErrors = {};
    for (const [key, value] of Object.entries(originalError)) {
        transformedErrors[key] = {
            message: value.msg // Extract the message from the original error
        };
    }
    return transformedErrors;
}

function imageUrl(path = '') {
    if (!path) return null;
    const fullPath = join(getPublicPath(), path);
    if(!existsSync(fullPath)) return null;

    const plain_path = path.startsWith('/') ? path.slice(1) : path;
    const plain_app_url = app_url.endsWith('/') ? app_url.slice(0, -1) : app_url;

    return plain_app_url + '/' + plain_path
}

function prepareChatParticipantsInfo(participants = []) {
    return participants.map(p => ({
        id: p._id,
        username: p.username,
        profile_picture_icon: imageUrl(p.profile_picture_icon),
    }));
}

function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
}

module.exports = {
    addTime,
    imageUrl,
    apiResponse,
    asyncHandler,
    getPublicPath,
    formatFileSize,
    transformError,
    generateRandStr,
    getPublicFilePath,
    prepareChatParticipantsInfo,
}