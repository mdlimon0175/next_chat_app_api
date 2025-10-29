const Conversation = require('../../models/Conversation');
const ConversationFactory = require('../factories/ConversationFactory');

class ConversationSeeder {
    async run() {
        const conversaitons = await ConversationFactory.getConversation();
        await Conversation.insertMany(conversaitons);

        return;
    }
}

module.exports = new ConversationSeeder();