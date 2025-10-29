const User = require('../../models/User');
const UserFactory = require("../factories/UserFactory");

class UserSeeder {
    async run() {
        const userData = await UserFactory.getAdmin();
        await User.insertOne(userData, { lean: true });

        return;
    }

    async seedMany(count = 5) {
        const usersData = await UserFactory.getUsers(count);
        const users = await User.insertMany(usersData, { lean: true });

        console.log({
            users: {
                insertedEmails: users.map(user => user.email),
                password: await UserFactory.getPassword()
            }
        })

        return;
    }

    async seedOne() {
        const userData = await UserFactory.getUser();
        const user = await User.insertOne(userData, { lean: true });

        console.log({
            users: {
                insertedEmail: user.email,
                password: await UserFactory.getPassword()
            }
        })

        return;
    }
}

module.exports = new UserSeeder();