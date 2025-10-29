const MessageEvent = require("./events/MessageEvent");
const ConversationEvent = require("./events/ConversationEvent");

const authListener = require("./listeners/authListener");
const callListener = require("./listeners/callListener");

function onSocketConnectionHandler(io, socket) {
    authListener(io, socket);
    callListener(io, socket);
    MessageEvent.setSocket(io);
    ConversationEvent.setSocket(io);

    // socket.on('disconnect', (reason) => {
    //     console.log({
    //         id: socket.id,
    //         user: socket?.user,
    //         type: "disconnected",
    //     })
    // })
}

module.exports = onSocketConnectionHandler;