const { readdir, unlink } = require("fs");
const { MulterError } = require("multer");
const { TokenExpiredError } = require("jsonwebtoken");

const logger = require("../../logger");
const { extname, join } = require("path");
const { debug } = require("../../config/app");
const { apiResponse } = require("../../helper/helper");
const errorMessage = require("../../enum/errorMessage");
const fileFieldname = require("../../enum/fileFieldname");

class ApiError extends Error {
    constructor(status = 500, message = "Internal Server Error!") {
        super();
        this.status = status;
        this.message = message;
        this.data = {
            status: false,
            message,
            data: null,
            error: {
                status,
                message
            }
        }
    }
}

function notFoundHandler(req, res, next) {
    return next(new ApiError(404, "Resource not found!"));
}

function errorHandler(err, req, res, next) {
    logger.error(err.message, {
        method: req.method,
        request_url: req.originalUrl,
        request_body: req.body,
        request_params: req.params,
        request_query: req.query,
        stack: err?.stack
    });

    if (req.file) {
        const { destination, fieldname, filename, path } = req.file;
        const fileExt = extname(filename);
        const iconFilename = filename.replace(fileExt, "_icon_");

        // delete icon file
        if(fieldname === fileFieldname.PROFILE_PICTURE) {
            readdir(destination, (err, files) => {
                if(err) {
                    logger.error("Failed to delete request icon", {
                        error_message: err.message,
                        icon_expected_name: iconFilename,
                        stack: err.stack
                    });
                } else {
                    let iconFile;
                    let start = 0;
                    let end = files.length - 1;
                    
                    // files are arrange by ascending order
                    while(start <= end) {
                        const mid = Math.floor((start + end) / 2);
                        if(files[mid].startsWith(iconFilename)) {
                            unlink(
                                join(destination, files[mid]),
                                (error) => {
                                    if (error) {
                                        logger.error("Failed to unlink request icon file", {
                                            icon_path: iconFile,
                                            error_message: error.message,
                                            stack: error.stack
                                        });
                                    }
                                }
                            );
                            return;
                        } else if(files[mid] < iconFilename) {
                            start = mid + 1;
                        } else {
                            end = mid - 1;
                        }
                    }
                }
            })
        }

        // delete original file
        unlink(
            path,
            (error) => {
                if (error) {
                    logger.error("Failed to unlink request file", {
                        method: req.method,
                        request_url: req.url,
                        file_path: path,
                        error_message: error.message,
                        stack: error.stack
                    });
                }
            }
        );
    }

    if(err instanceof MulterError) {
        return res.status(400).json(apiResponse(false, `${err.message} - ${err.field}`));
    } else if(err instanceof TokenExpiredError) {
        return res.status(401).json(apiResponse(false, "Token expired!"));
    }

    const status = err.status || 500;
    const message = status === 500 ? errorMessage[500] : err.message;
    return res.status(status).json(apiResponse(false, message, null, { message: debug ? err?.message : message }));
}

module.exports = {
    ApiError,
    errorHandler,
    notFoundHandler
}