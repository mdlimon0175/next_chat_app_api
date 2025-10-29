const multer = require('multer');
const { join, extname } = require('path');
const { existsSync, mkdirSync } = require('fs');

const filePathname = require('../enum/filePathname');
const { getPublicFilePath, getPublicPath } = require('./helper');
const { ApiError } = require('../http/middleware/errorMiddleware');

const imageArr = ['image/jpeg', 'image/jpg', 'image/png'];
const fileUploader = function(fileSize = 1048600, acceptedTypes = imageArr, filePath = filePathname.USER) {
    const storePath = join(getPublicPath(), getPublicFilePath(filePath));
    if(!existsSync(storePath)) {
        mkdirSync(storePath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, storePath);
        },
        filename: function(req, file, cb) {
            const fileExt = extname(file.originalname);
            const fileName = file.originalname.replace(fileExt, '')
                .toLowerCase()
                .normalize("NFKD")
                .replace(/[^\w\s-]/g, '')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[\s-]+/g, '_') + '_' + Date.now() + fileExt;
            cb(null, fileName);
        }
    });

    return multer({
        storage,
        limits: { fileSize },
        fileFilter: function(req, file, cb) {
            if(acceptedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new ApiError(
                    400,
                    'Invalid file type. Only JPEG and PNG are allowed.'
                ));
            }
        }
    });
}

module.exports = fileUploader;