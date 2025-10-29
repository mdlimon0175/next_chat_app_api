const { hash, compare } = require("bcrypt");

const User = require("../../models/User");
const { apiResponse } = require("../../helper/helper");

const errorMessage = require('../../enum/errorMessage');

const userResource = require('../apiResources/userResource');
const { jwt_salt_round } = require('../../config/app');
const AuthService = require("../services/AuthService");

class AuthController {
    #invalid_req_response = apiResponse(false, "Invalid email or password.");

    login = async (req, res) => {
        const { email, password } = req.body;

        const user = await User.findByEmail(email).select("+password +profile_picture");
        if (!user) {
            return res.status(400).json(this.#invalid_req_response);
        }

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json(this.#invalid_req_response);
        }

        const token = await AuthService.generateToken(user._id);
        const finalUser = userResource(user);
        return res.json(apiResponse(true, "Login Successful!", { user: finalUser, token }));
    }

    registration = async (req, res) => {
        const { email, username, password } = req.body;

        const [profile_picture, profile_picture_icon] = await AuthService.uploadProfilePicutre(req.file);
        const hashedPassword = await hash(password, parseInt(jwt_salt_round));
        await User.create({
            email,
            username,
            profile_picture,
            profile_picture_icon,
            password: hashedPassword
        });

        return res.status(201).json(
            apiResponse(true, 'Registration Successful!')
        );
    }

    tokenUser = async (req, res) => {
        const token = req.header("Authorization")?.split(" ")[1];
        const user = await AuthService.getTokenUser(token);
        if(!user) {
            return res.status(401).json(apiResponse(false, errorMessage[401]));
        }
        return res.json(apiResponse(true, "token user", userResource(user)));
    }

    logout = async (req, res) => {
        const token = req.header("Authorization")?.split(" ")[1];
        const logoutSuccess = await AuthService.userLogout(token);

        if(!logoutSuccess) {
            return res.status(400).json(apiResponse(false, "Invalid request"));
        }
        return res.status(200).json(apiResponse(true, "Logout successful!"));
    }
}

module.exports = new AuthController();
