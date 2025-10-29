const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    profile_picture: {
        type: String,
        select: false,
    },
    profile_picture_icon: {
        type: String,
    },
    password: {
        type: String,
        select: false,
        required: true,
    }
}, { timestamps: true });

userSchema.set("toJSON", {
    transform(doc, ret) {
        const {__v, password, ...rest} = ret;
        return rest;
    }
});

userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email });
};

userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username: username });
};

userSchema.index({ email: true }, { unique: true });
userSchema.index({ username: true }, { unique: true });

const User = mongoose.model('User', userSchema);
module.exports = User;