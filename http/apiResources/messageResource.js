function messageResource(data) {
    const prepareMessages = (m) => ({
        id: m._id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        message: m.message,
        sent_at: m.sent_at
    });

    return Array.isArray(data) ? data.map(prepareMessages) : prepareMessages(data);
}

module.exports = messageResource;