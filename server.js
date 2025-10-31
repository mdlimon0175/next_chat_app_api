const app = require('./app');
const { createServer } = require('http');
const { Server: SocketServer } = require('socket.io');

// config
const appConfig = require('./config/app');

// others
const connectDB = require('./db');
const onSocketConnectionHandler = require('./socket');
const socketAuthMiddleware = require('./http/middleware/socketAuthMiddleware');

// create server and connect databasse
const server = createServer(app);
connectDB();

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