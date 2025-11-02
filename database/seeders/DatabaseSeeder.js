const logger = require("../../logger");
const UserSeeder = require("./UserSeeder");
const ConversationSeeder = require("./ConversationSeeder");

class DatabaseSeeder {
    async run() {
        try {
            await UserSeeder.run();
            await ConversationSeeder.run();

            return true;
        } catch(error) {
            logger.error("Failed to seed", {
                error_message: error?.message,
                stack: error?.stack
            });
            return false;
        }
    }
}

module.exports = new DatabaseSeeder();