const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");

const { apiResponse } = require("../../helper/helper");
const MessageEvent = require("../../events/MessageEvent");
const messageResource = require("../apiResources/messageResource");

class MessageController {
    #message_per_page = 30;
    #not_found_api_response = apiResponse(false, 'Conversation not found!');

    index = async (req, res) => {
        const { conversation_id } = req.params;
        const page = parseInt(req.query.page) || 1;

        const conversation = await Conversation.findOne({
            _id: conversation_id,
            participants: { $in: [req.user._id] }
        });
        if (!conversation) {
            return res.status(404).json(this.#not_found_api_response);
        }

        const pagination = await this.#getPaginationData(conversation_id, page);
        if(pagination.pages < page) {
            const data = {
                messages: [],
                pagination
            }
            return res.status(200).json(apiResponse(true, 'Messages!', data));
        }

        /**
        * @note_next_update - add call data to message list
        */
        const messages = await Message.find({ conversation_id })
            .where("message").ne(null)
            .sort({ createdAt: -1 })
            .skip((page - 1) * this.#message_per_page)
            .limit(this.#message_per_page);

        const finalMessages = messageResource(messages.reverse());
        const data = {
            conversation_id,
            messages: finalMessages,
            pagination
        }
        return res.status(200).json(apiResponse(true, 'Messages', data));
    }

    store = async (req, res) => {
        const { conversation_id } = req.params;
        const { receiver_id, message } = req.body;
        const sender_id = req.user._id.toString();

        const conversation = await Conversation.findOne({
            _id: conversation_id,
            participants: {$all: [
                sender_id,
                receiver_id
            ]}
        });

        if (!conversation) {
            return res.status(400).json(this.#not_found_api_response);
        }

        const newMessage = new Message({
            sender_id,
            receiver_id,
            conversation_id: conversation._id,
            message,
            sent_at: new Date()
        });
        await newMessage.save();

        conversation.last_message = newMessage._id;
        await conversation.save();

        const finalMessage = messageResource(newMessage);
        MessageEvent.addMessageEvent([receiver_id, sender_id], finalMessage);
        return res.status(201).json(apiResponse(true, 'Message added'));
    }

    #getPaginationData = async (conversation_id, page) => {
        const totalMessages = await Message.where("message").ne(null).countDocuments({ conversation_id });
        const pages = Math.ceil(totalMessages / this.#message_per_page);

        return {
            currentPage: page,
            pages,
            total: totalMessages,
            perPage: this.#message_per_page
        }
    }
}

module.exports = new MessageController();