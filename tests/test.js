const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { jwt_secret } = require('../config/app');

const app = require('../app');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { apiResponse } = require('../helper/helper');
const errorMessage = require('../enum/errorMessage');
const Message = require('../models/Message');
const UserSeeder = require('../database/seeder/UserSeeder');

describe('Test conversations resource', () => {
    beforeAll(async () => {
        console.log(`${globalThis.__MONGO_URI__}/${globalThis.__MONGO_DB_NAME__}`);
        mongoose.connect(`${globalThis.__MONGO_URI__}/${globalThis.__MONGO_DB_NAME__}`).catch(err => {
            console.log(err);
        })
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

//     const token = jwt.sign({ _id: user._id }, jwt_secret, { expiresIn: '1h'});
    it('GET /api/conversations without token -> 401', async () => {
        const res = await request(app).get('/api/conversations');

        expect(res.status).toBe(401);
    })

//     it('GET /api/conversations', async () => {
//         const totalConversations = 10;
//         const conversation_per_page = 10;
//         const mockConversations = jest.fn(() => [conversation]);
//         jest.spyOn(Conversation, 'countDocuments')
//             .mockResolvedValue(totalConversations);
//         jest.spyOn(Conversation, 'aggregate')
// 			.mockImplementation(() => mockConversations());

//         const page = 1;
//         const totalPages = Math.ceil(totalConversations / conversation_per_page);

//         const res = await request(app)
//             .get('/api/conversations')
//             .set('Authorization', `Bearer ${token}`);

//         expect(Conversation.aggregate).toHaveBeenCalledTimes(1);
//         expect(Conversation.countDocuments).toHaveBeenCalledTimes(1);

//         expect(res.status).toBe(200);
//         expect(res.type).toBe('application/json');
//         expect(res.body.data.pagination).toEqual({
//             currentPage: page,
//             pages: totalPages,
//             total: totalConversations,
//             perPage: conversation_per_page
//         });
//     })

//     it('GET /api/conversation/:id', async () => {
//         const mockConversation = jest.fn(() => conversation);
//         jest.spyOn(Conversation, 'findOne')
//             .mockReturnValue({
//                 select: jest.fn().mockReturnThis(),
//                 populate: jest.fn().mockReturnThis(),
//                 lean: jest.fn().mockImplementation(() => mockConversation())
//             });

//         const res = await request(app)
//             .get(`/api/conversations/${conversation._id}`)
//             .set('Authorization', `Bearer ${token}`);

//         expect(Conversation.findOne).toHaveBeenCalledTimes(1);

//         expect(res.status).toBe(200);
//         expect(res.type).toBe('application/json');
//     })

//     it('GET /api/conversations/:id can handle 404', async () => {
//         jest.spyOn(Conversation, 'findOne').mockReturnValue({
//                 select: jest.fn().mockReturnThis(),
//                 populate: jest.fn().mockReturnThis(),
//                 lean: jest.fn().mockReturnValue(null)
//             });
//         const res = await request(app)
//             .get(`/api/conversations/${new mongoose.Types.ObjectId}`)
//             .set('Authorization', `Bearer ${token}`);

//         expect(res.status).toBe(404);
//         expect(res.type).toBe('application/json');
//         expect(res.body).toEqual(apiResponse(false, 'Conversation not found!'));
//     })

//     it('POST /api/conversation can handle validation', async () => {
//         const res = await request(app)
//             .post('/api/conversations')
//             .set('Authorization', `Bearer ${token}`)
//             .send();

//         expect(res.type).toBe('application/json');
//         expect(res.status).toBe(400);
//     })
})

// expect(Conversation.countDocuments).toHaveBeenCalledWith({
//     participants: { $in: [user._id] }
// });
// expect(Conversation.aggregate).toHaveBeenCalledWith([
//     { $match: { participants: user._id } },
//     { $lookup: {
//         from: 'users',
//         localField: 'participants',
//         foreignField: '_id',
//         as: 'participants'
//     }},
//     { $lookup: {
//         from: 'messages',
//         localField: 'last_message',
//         foreignField: '_id',
//         as: 'last_message'
//     }},
//     { $unwind: { path: "$last_message", preserveNullAndEmptyArrays: true } },
//     { $sort: { "last_message.sent_at": -1 } },
//     { $skip: (page - 1) * conversation_per_page },
//     { $limit: conversation_per_page }
// ]);
