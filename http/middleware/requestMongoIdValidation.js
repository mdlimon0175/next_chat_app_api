const { default: mongoose } = require("mongoose");
const { apiResponse } = require("../../helper/helper");

function requestMongoIdValidation(paramName = '') {
    return (req, res, next) => {
        const param = req.params?.[paramName];

        if(!mongoose.Types.ObjectId.isValid(param)) {
            return res.status(400).json(apiResponse(false, 'Invalid request!'));
        }

        next();
    }
}

module.exports = requestMongoIdValidation;