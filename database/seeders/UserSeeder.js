const User = require('../../models/User');
const UserFactory = require("../factories/UserFactory");

class UserSeeder {
    async run() {
        const userData = await UserFactory.getAdmin();
        const existingUserData = await User.findOne({
            email: userData.email,
            username: userData.username
        });

        if(existingUserData) {
            console.log(`Admin email - ${userData.email}`);
        } else {
            await User.insertOne(userData);
        }

        return;
    }

    async seedMany(count = 5) {
        const usersData = await UserFactory.getUsers(count);
        const users = await User.insertMany(usersData);

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
        const user = await User.insertOne(userData);

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