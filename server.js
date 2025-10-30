const app = require('./app');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server: SocketServer } = require('socket.io');

// config
const appConfig = require('./config/app');

// others
const onSocketConnectionHandler = require('./socket');
const socketAuthMiddleware = require('./http/middleware/socketAuthMiddleware');
const DatabaseSeeder = require('./database/seeders/DatabaseSeeder');

// create server
const server = createServer(app);

mongoose.connect(appConfig.databaseURL).then(fullfill => {
    console.log("database connected!");
    const runSeeder = process.argv.findIndex(argv => argv === 'db:seed') !== -1;
    if(process.env.NODE_ENV === 'production' && runSeeder) {
        DatabaseSeeder.run().then(result => {
            if(result) {
                console.log('Seed successful!');
            } else {
                console.log('Failed to seed data');
            }
        })
    }
}).catch(err => {
    console.log(err);
});

// socket.io setup
const io = new SocketServer(server, {
    cors: {
        origin: [appConfig.frontend_url]
    }
});
io.use(socketAuthMiddleware);
io.on('connection', (socket) => {
    onSocketConnectionHandler(io, socket)
});

server.listen(appConfig.port, () => {
    console.log(`Server running on port - ${appConfig.port}`);
});