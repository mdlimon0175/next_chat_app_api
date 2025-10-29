const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    created_by: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    last_message: {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: null
    },
}, {timestamps: true});

conversationSchema.set("toJSON", {
    transform(doc, ret) {
        const {__v, ...rest} = ret;
        return rest;
    }
});

conversationSchema.index({ participants: true });

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;