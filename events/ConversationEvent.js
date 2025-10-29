const { Server } = require("socket.io");

class ConversationEvent {
    #io;

    addConversationEvent(to, data) {
        if(this.#io) {
            this.#io.to(to).emit('add_conversation', data);
        } else {
            // add to queue list and perform after io init
            console.log(`Failed to emit event - add_conversation. io not defined.`);
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

module.exports = new ConversationEvent();