const { hash } = require("bcrypt");
const { faker } = require("@faker-js/faker");

const { jwt_salt_round } = require("../../config/app");

class UserFactory {
    #password = '1234';
    #hashedPassword;

    async getPassword() {
        return this.#password;
    }

    async #getHashedPassword() {
        if(this.#hashedPassword) {
            return this.#hashedPassword
        }
        return this.#hashedPassword = await hash(this.#password, jwt_salt_round);
    }

    async getAdmin() {
        const password = await this.#getHashedPassword();
        return {
            username: 'mdlimon0175',
            email: 'mdlimon0175@gmail.com',
            password
        }
    }

    async getUser() {
        const password = await this.#getHashedPassword();
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