const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");

const messageResource = require("../apiResources/messageResource");
const ConversationEvent = require("../../events/ConversationEvent");
const conversationResource = require("../apiResources/conversationResource");
const { apiResponse, prepareChatParticipantsInfo } = require("../../helper/helper");


class ConversationController {
    #conversation_per_page = 10;

    index = async (req, res) => {
        const page = parseInt(req.query.page) || 1;

        const pagination = await this.#getPaginationData(req.user._id, page);
        if(pagination.pages < page) {
            const data = {
                conversations: [],
                pagination
            }
            const message = `${page > 1 ? "No more conversations!" : "No conversations!"}`;
            return res.status(200).json(apiResponse(true, message, data));
        }

        const conversations = await Conversation.aggregate([
            { $match: { participants: req.user._id } },
            { $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'participants',
                pipeline: [{
                    $project: {
                        _id: 1,
                        username: 1,
                        profile_picture_icon: 1
                    }
                }]
            }},
            { $lookup: {
                from: 'messages',
                localField: 'last_message',
                foreignField: '_id',
                as: 'last_message',
                pipeline: [{
                    $project: {
                        _id: 1,
                        sender_id: 1,
                        message: 1,
                        sent_at: 1
                    }
                }]
            }},
            { $unwind: { path: "$last_message", preserveNullAndEmptyArrays: true } },
            { $sort: { "last_message.sent_at": -1 } },
            { $skip: (page - 1) * this.#conversation_per_page },
            { $limit: this.#conversation_per_page }
        ]);

        const finalConversations = conversationResource(conversations);
        const data = {
            conversations: finalConversations,
            pagination
        }

        return res.status(200).json(apiResponse(true, "Conversations", data));
    }

    show = async (req, res) => {
        const { conversation_id } = req.params;

        const conversation = await Conversation.findOne({
            _id: conversation_id,
            participants: { $in: [req.user._id] }
        })
        .select('created_by createdAt')
        .populate('participants', 'username profile_picture_icon')
        .lean();

        if (!conversation) {
            return res.status(404).json(apiResponse(false, "Conversation not found!"));
        }

        const data = {
            id: conversation._id,
            participants: prepareChatParticipantsInfo(conversation.participants),
            created_by: conversation.created_by,
            created_at: conversation.createdAt
        }

        return res.status(200).json(apiResponse(true, 'Conversation', data));
    }

    store = async (req, res) => {
        const { receiver_id, message } = req.body;
        const sender_id = req.user._id.toString();

        let conversation = await Conversation.findOne({
            participants: { $all: [sender_id, receiver_id] }
        }).select('_id');

        if (!conversation) {
            conversation = new Conversation({
                participants: [sender_id, receiver_id],
                created_by: sender_id,
            });
            await conversation.save();
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

        const newConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username profile_picture_icon')
        .populate('last_message', 'sender_id message sent_at')
        .lean();

        const finalConversation = conversationResource(newConversation);
        const finalMessage = messageResource(newMessage);
        const data = {
            conversation: finalConversation,
            message: finalMessage
        }

        ConversationEvent.addConversationEvent([receiver_id, sender_id], data);
        return res.status(201).json(apiResponse(true, 'Conversation added', { conversation_id: conversation._id}));
    }

    #getPaginationData = async (user_id, page) => {
        const totalConversations = await Conversation.countDocuments({
            participants: { $in: [user_id]}
        });

        const pages = Math.ceil(totalConversations / this.#conversation_per_page);
        return {
            currentPage: page,
            pages,
            total: totalConversations,
            perPage: this.#conversation_per_page
        }
    }
}

module.exports = new ConversationController();