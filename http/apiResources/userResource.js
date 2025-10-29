const { imageUrl } = require("../../helper/helper");

function userResource(data) {
    return {
        id: data._id,
        username: data.username,
        profile_picture: imageUrl(data?.profile_picture),
        profile_picture_icon: imageUrl(data?.profile_picture_icon),
    }
}

module.exports = userResource;