const { default: mongoose } = require("mongoose");
const ConversationSeeder = require("./ConversationSeeder");
const UserSeeder = require("./UserSeeder");
const appConfig = require("../../config/app");

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