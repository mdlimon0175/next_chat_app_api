const ConversationSeeder = require("./ConversationSeeder");
const UserSeeder = require("./UserSeeder");

class DatabaseSeeder {
    async run() {
        try {
            await UserSeeder.run();
            await ConversationSeeder.run();

            return true;
        } catch(error) {
            return false;
        }
    }
}

module.exports = new DatabaseSeeder();