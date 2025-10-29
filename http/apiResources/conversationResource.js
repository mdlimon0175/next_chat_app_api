const { prepareChatParticipantsInfo } = require("../../helper/helper");

function conversationResource(data) {
    const prepareConversations = (c) => ({
        id: c._id,
        participants: prepareChatParticipantsInfo(c.participants),
        last_message: {
            id: c.last_message._id,
            sender_id: c.last_message.sender_id,
            message: c.last_message.message,
            sent_at: c.last_message.sent_at,
        },
    });

    return Array.isArray(data) ? data.map(prepareConversations) : prepareConversations(data);
}

module.exports = conversationResource;