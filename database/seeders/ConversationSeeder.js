const Conversation = require('../../models/Conversation');
const ConversationFactory = require('../factories/ConversationFactory');

class ConversationSeeder {
    async run() {
        const conversations = await ConversationFactory.getConversation();
        if(!Array.isArray(conversations)) {
            const existingConversationData = await Conversation.findOne({
                participants: { $all: conversations.participants }
            });

            if(!existingConversationData) {
                await Conversation.insertOne(conversations);
            }
            return
        }
        await Conversation.insertMany(conversations);
        return
    }
}

module.exports = new ConversationSeeder();