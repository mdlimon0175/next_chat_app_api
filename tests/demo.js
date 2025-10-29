const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app'); // Assuming your app is exported from this file
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const { apiResponse } = require('../../utils/response'); // Adjust based on your structure
const { conversationResource, messageResource } = require('../../utils/resources');
const ConversationEvent = require('../../events/ConversationEvent');

jest.mock('../../models/Conversation');
jest.mock('../../models/Message');
jest.mock('../../events/ConversationEvent');

describe('POST /api/conversations', () => {
    let token; // Assuming you generate a JWT token for authorization

    beforeAll(() => {
        // Generate a token for the user (you should implement this logic based on your setup)
        token = 'mock-token';
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks to ensure isolated tests
    });

    it('should create a new conversation and message when no conversation exists', async () => {
        const sender_id = 'senderId';
        const receiver_id = 'receiverId';
        const message = 'Hello!';

        // Mock the necessary methods
        Conversation.findOne.mockResolvedValue(null);  // No conversation found
        Conversation.prototype.save.mockResolvedValue(true); // Simulate save success
        Message.prototype.save.mockResolvedValue(true);  // Simulate message save success
        Conversation.findById.mockResolvedValue({
            _id: 'mockConversationId',
            participants: [{ username: 'User1', profile_picture_icon: 'pic1' }, { username: 'User2', profile_picture_icon: 'pic2' }],
            last_message: { sender_id, message, sent_at: new Date() }
        }); // Mock finding conversation after saving

        // Simulate the POST request
        const res = await request(app)
            .post('/api/conversations')
            .set('Authorization', `Bearer ${token}`)
            .send({ receiver_id, message });

        // Expect the necessary things to happen
        expect(Conversation.findOne).toHaveBeenCalledWith({
            participants: { $all: [sender_id, receiver_id] }
        });
        expect(Conversation.prototype.save).toHaveBeenCalledTimes(1);
        expect(Message.prototype.save).toHaveBeenCalledTimes(1);
        expect(Conversation.findById).toHaveBeenCalledTimes(1);
        expect(ConversationEvent.addConversationEvent).toHaveBeenCalledTimes(1);

        // Check the response
        expect(res.status).toBe(201);
        expect(res.body).toEqual(apiResponse(true, 'Conversation added', { conversation_id: 'mockConversationId' }));
    });

    it('should add a message to an existing conversation', async () => {
        const sender_id = 'senderId';
        const receiver_id = 'receiverId';
        const message = 'Hello!';

        // Mock the necessary methods
        const existingConversation = { _id: 'existingConversationId', participants: [sender_id, receiver_id] };
        Conversation.findOne.mockResolvedValue(existingConversation);  // Found existing conversation
        Message.prototype.save.mockResolvedValue(true);  // Simulate message save success
        Conversation.findById.mockResolvedValue({
            _id: 'existingConversationId',
            participants: [{ username: 'User1', profile_picture_icon: 'pic1' }, { username: 'User2', profile_picture_icon: 'pic2' }],
            last_message: { sender_id, message, sent_at: new Date() }
        });

        // Simulate the POST request
        const res = await request(app)
            .post('/api/conversations')
            .set('Authorization', `Bearer ${token}`)
            .send({ receiver_id, message });

        // Ensure conversation was found and message was added
        expect(Conversation.findOne).toHaveBeenCalledWith({
            participants: { $all: [sender_id, receiver_id] }
        });
        expect(Conversation.prototype.save).not.toHaveBeenCalled();
        expect(Message.prototype.save).toHaveBeenCalledTimes(1);
        expect(Conversation.findById).toHaveBeenCalledTimes(1);
        expect(ConversationEvent.addConversationEvent).toHaveBeenCalledTimes(1);

        // Check the response
        expect(res.status).toBe(201);
        expect(res.body).toEqual(apiResponse(true, 'Conversation added', { conversation_id: 'existingConversationId' }));
    });
});


// it('POST /api/conversations should update existing conversation', async () => {
    //     const mockConversation = jest.fn(() => conversation);
    //     jest.spyOn(Conversation, 'findOne').mockImplementation(() => {
    //         return {
    //             select: jest.fn().mockResolvedValue(mockConversation)
    //         }
    //     });
    //     jest.spyOn(Message.prototype, 'save')
    //         .mockResolvedValue(true);
    //     jest.spyOn(Conversation.prototype, 'save')
    //         .mockResolvedValue(true);
    //     jest.spyOn(Conversation, 'findById').mockReturnValue({
    //         populate: jest.fn().mockReturnThis(),
    //         populate: jest.fn().mockReturnThis(),
    //         lean: jest.fn().mockImplementation(() => mockConversation())
    //     })

    //     const res = await request(app).post('/api/conversations').send({
    //         receiver_id: `${new mongoose.Types.ObjectId}`,
    //         message: "Hi!"
    //     }).set('Authorization', `Bearer ${token}`);

    //     expect(res.status).toBe(201);
    // })