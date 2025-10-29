const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender_id: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversation_id: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    message: { type: String, default: null },
    sent_at: { type: Date, required: true}
}, { timestamps: true });

messageSchema.set("toJSON", {
    transform(doc, ret) {
        const {__v, ...rest} = ret;
        return rest;
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;