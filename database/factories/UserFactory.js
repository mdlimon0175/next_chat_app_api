const { hash } = require("bcrypt");
const { faker } = require("@faker-js/faker");


class UserFactory {
    #password;

    async getPassword() {
        if(this.#password) {
            return this.#password
        }
        return this.#password = await hash('1234', 10);
    }

    async getAdmin() {
        const password = await this.getPassword();
        return {
            username: 'mdlimon0175',
            email: 'mdlimon0175@gmail.com',
            password
        }
    }

    async getUser() {
        const password = await this.getPassword();
        return {
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password
        }
    }

    async getUsers(length = 5) {
        const users = [];
        for(let i = 0; i < length; i++) {
            users.push(await this.getUser());
        }

        return users;
    }
}

module.exports = new UserFactory();