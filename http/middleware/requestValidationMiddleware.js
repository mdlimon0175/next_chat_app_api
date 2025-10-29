const { unlink } = require('fs');
const { validationResult } = require("express-validator");

const logger = require('../../logger');
const { transformError, apiResponse } = require('../../helper/helper');

function requestValidationMiddleware(req, res, next) {
    const mappedErrors = validationResult(req).mapped();
    if (!Object.keys(mappedErrors).length && !req.fileError) {
        return next();
    } else {
        if (req.file) {
            unlink(
                req.file.path,
                (error) => {
                    if (error) {
                        logger.error("Failed to unlink request file", {
                            method: req.method,
                            request_url: req.url,
                            file_path: req.file.path,
                            error_message: error.message
                        });
                    }
                }
            );
        }

        if(req.fileError) {
            mappedErrors[req.fileError.fieldname ?? "file_error"] = {
                msg: req.fileError.message
            }
        }

        return res.status(400).json(apiResponse(false, "Validation error", null, transformError(mappedErrors)));
    }
}

module.exports = requestValidationMiddleware;