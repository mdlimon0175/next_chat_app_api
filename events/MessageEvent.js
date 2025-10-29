const { Server } = require("socket.io");

class MessageEvent {
    #io;

    addMessageEvent(to, data) {
        if(this.#io) {
            this.#io.to(to).emit('add_message', data);
        } else {
            // add to queue list and perform after io init
            console.log(`Failed to emit event - add_message. io not defined.`);
        }
    }

    setSocket(io) {
        if(!io instanceof Server) {
            console.log(`Invalid io instance`);
            return
        }
        if(this.#io) return;
        this.#io = io;
    }
}

module.exports = new MessageEvent();