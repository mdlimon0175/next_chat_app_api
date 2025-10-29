const { hash } = require("bcrypt");
const { join } = require("path");
const { unlink } = require("fs/promises");

const User = require("../../models/User");
const AuthService = require("../services/AuthService");

const logger = require("../../logger");
const { jwt_salt_round } = require("../../config/app");
const { apiResponse, getPublicPath } = require("../../helper/helper");

class UserController {
    getUser = async (req, res) => {
        const { search } = req.params;
        const user = await User.findOne({
            $or: [{ email: search }, { username: search }],
        }).select("_id").lean();

        if (!user) {
            return res.status(400).json(apiResponse(false, "User not found!"));
        }

        return res.json(apiResponse(true, "User", user._id));
    }

    changeProfileInfo = async (req, res) => {
        const { email, username, password } = req.body;

        const { user_id } = req.params;
        const user = await User.findById(user_id).select("+profile_picture");

        const [new_profile, new_profile_icon] = await AuthService.uploadProfilePicutre(req.file);
        if (new_profile) {
            await this.#unlinkOldPictures([
                user.profile_picture,
                user.profile_picture_icon
            ]);
        }

        user.username = username;
        user.email = email;
        user.profile_picture = new_profile ? new_profile : user.profile_picture;
        user.profile_picture_icon = new_profile_icon ? new_profile_icon : user.profile_picture_icon;
        const hashedPassword = await hash(password, parseInt(jwt_salt_round));
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json(apiResponse(true, "Profile info updated!"));
    }

    async #unlinkOldPictures(old_pictures = ['', '']) {
        const public_path = getPublicPath();
        try {
            for (let i = 0; i < old_pictures.length; i++) {
                if(old_pictures[i]) {
                    await unlink(join(public_path, old_pictures[i]));
                }
            }
        } catch(err) {
            logger.error('Failed to unlink old profile pictures', {
                file_path: old_pictures[0] && join(public_path, old_pictures[0]),
                icon_path: old_pictures[1] && join(public_path, old_pictures[1]),
                error_message: err?.message,
                stack: err?.stack
            });
        }
    }
}

module.exports = new UserController();
