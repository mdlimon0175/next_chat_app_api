const { MulterError } = require('multer');

const fileUploader = require("../../../helper/fileUploader");
const { formatFileSize } = require('../../../helper/helper');
const { PROFILE_PICTURE } = require('../../../enum/fileFieldname');

const maxSize = 1048600; // 1mb
const fileTypes = ['image/jpeg', 'image/jpg', 'image/png'];

const profilePictureRequest = function(req, res, next) {
    fileUploader(maxSize, fileTypes)
    .single(PROFILE_PICTURE)
    (req, res, function(err) {
        if (err instanceof MulterError) {
            req.fileError = {
                fieldname: err.field
            }
            switch(err.code) {
                case "LIMIT_FILE_SIZE":
                    req.fileError.message = `File too large. Maximum file size is ${formatFileSize(maxSize)}.`;
                    break
                case "LIMIT_UNEXPECTED_FILE":
                    req.fileError.message = "The uploaded file field is not expected.";
                    break
                    // add other field check message as required.
                default:
                    req.fileError.message = err.message
            }
        } else if (err) {
            req.fileError = {
                fieldname: err?.field ?? PROFILE_PICTURE,
                message: err.message
            }
        }
        next();
    })
}

module.exports = profilePictureRequest;