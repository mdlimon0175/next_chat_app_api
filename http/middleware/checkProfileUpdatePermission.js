const User = require("../../models/User");
const { apiResponse } = require("../../helper/helper");

async function checkProfileUpdatePermission(req, res, next) {
    const { user_id } = req.params;
    const user = await User.findById(user_id).select("_id").lean();

    if (!user || !user._id.equals(req.user._id)) {
        return res.status(400).json(apiResponse(false, "Invalid request!"));
    }
    return next();
}

module.exports = checkProfileUpdatePermission;