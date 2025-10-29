const mongoose = require('mongoose');
const callStatus = require('../enum/callStatus');
const Schema = mongoose.Schema;

const callSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }],
    conversation_id: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    message_id: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true
    },
    status: { type: String, default: callStatus.MISSED, index: true },
    duration: { type: Number, default: 0 },
    started_at: { type: Date, default: new Date() },
    ended_at: { type: Date, default: null }
}, { timestamps: true });

callSchema.set("toJSON", {
    transform(doc, ret) {
        const {__v, createdAt, updatedAt, ...rest} = ret;
        return rest;
    }
});

const Call = mongoose.model('Call', callSchema);
module.exports = Call;