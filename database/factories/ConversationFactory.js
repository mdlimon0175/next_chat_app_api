const User = require("../../models/User");
const UserFactory = require("./UserFactory");

class ConversationFactory {
    #users = [];
    #participants_length = 2;
    constructor(users = []) {
        const validUsers = users.filter(user => user instanceof User).map(user => user._id);
        if(validUsers.length >= this.#participants_length) {
            this.#users = validUsers;
        }
    }

    #getRandomCreator(participants = []) {
        const index = Math.floor(Math.random() * 2);
        return participants[index];
    }

    #getParticipantsPairs(index = 0, pairs = []) {
        if (index >= this.#users.length) return pairs;

        for (let i = index + 1; i < this.#users.length; i++) {
            pairs.push([this.#users[index], this.#users[i]]);
        }
        return this.#getParticipantsPairs(index + 1, pairs);
    }

    async getConversation() {
        const users_length = this.#users.length;
        if(users_length >= this.#participants_length) {
            if(users_length === this.#participants_length) {
                return {
                    created_by: this.#getRandomCreator(this.#users),
                    participants: this.#getParticipantsPairs(),
                }
            } else {
                const pairs = this.#getParticipantsPairs();
                const conversations = [];

                for(let i = 0; i < pairs.length; i++) {
                    conversations.push({
                        created_by: this.#getRandomCreator(pairs[i]),
                        participants: pairs[i]
                    })
                }
                return conversations;
            }
        } else {
            try {
                const usersCount = await User.countDocuments();
                let users;
                let usersCollection;
                if (usersCount >= 2) {
                    usersCollection = await User.find().limit(2).select('_id email');
                    users = usersCollection.map(user => user._id);
                } else {
                    const usersData = await UserFactory.getUsers(2);
                    usersCollection = await User.insertMany(usersData);

                    users = usersCollection.map(user => user._id);
                }

                console.log({
                    users: {
                        insertedEmails: usersCollection.map(user => user.email),
                        password: await UserFactory.getPassword()
                    }
                })
                return {
                    created_by: this.#getRandomCreator(users),
                    participants: users.map(user => user._id),
                }
            } catch(error) {
                console.log(`ConversationFactory: Failed to create conversation participants - ${error?.message}`);
            }
        }
    }
}

module.exports = new ConversationFactory();