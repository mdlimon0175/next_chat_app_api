const { imageUrl } = require("../../helper/helper");

const imageCache = new Map();
function conversationResource(data) {
    const prepareConversations = (c) => ({
        id: c._id,
        participants: prepareChatParticipantsInfo(c.participants),
        last_message: Object.hasOwn(c, 'last_message') ? {
            id: c.last_message._id,
            sender_id: c.last_message.sender_id,
            message: c.last_message.message,
            sent_at: c.last_message.sent_at,
        } : null,
    });

    const finalData = Array.isArray(data) ? data.map(prepareConversations) : prepareConversations(data);
    imageCache.clear();
    return finalData;
}

function prepareChatParticipantsInfo(participants = []) {
    return participants.map(p => {
        if (!imageCache.has(p.username)) {
            imageCache.set(p.username, imageUrl(p.profile_picture_icon));
        }
        return {
            id: p._id,
            username: p.username,
            profile_picture_icon: imageCache.get(p.username),
        };
    });
}

module.exports = conversationResource;