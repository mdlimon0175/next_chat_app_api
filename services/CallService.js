const Call = require("../models/Call");
const Conversation = require("../models/Conversation");

const logger = require("../logger");
const callStatus = require("../enum/callStatus");
const { apiResponse, imageUrl } = require("../helper/helper");

class CallService {
    async findExistCall(user_id) {
        const existCall = await Call.findOne({
            participants: { $in: [user_id] },
            status: callStatus.STARTED,
            ended_at: null,
        })
        .select('conversation_id')
        .lean();

        return existCall;
    }

    async findConversationByIdAndUserId(_id, user_id) {
        const conversation = await Conversation.findOne({
            _id,
            participants: {$in: [user_id]}
        }).select('participants').populate('participants', 'username profile_picture').lean();

        if(!conversation) return null;

        const partner = conversation.participants.find(p => !p._id.equals(user_id));
        return {
            conversation_id: conversation._id,
            partner: {
                _id: partner._id,
                username: partner.username ?? 'Participant',
                profile_picture: partner.profile_picture
            }
        }
    }

    async updateCallInfo(callInfo, status = null) {
        callInfo.ended_at = new Date();
        if (status) {
            callInfo.status = status;
        }
        await callInfo.save();
    }

    static async callEndHandler(callDoc) {
        try {
            const now = new Date();
            callDoc.status = callStatus.ENDED;
            callDoc.ended_at = now;
            callDoc.duration = Math.floor((now - callDoc.started_at) / 1000);
            await callDoc.save();
        } catch(error) {
            logger.error("Failed to end call", {
                error_message: error.message,
                stack: error.stack
            });
        }
    }

    static callDataResponse(callInfo, partnerInfo) {
        const partner = {
            id: partnerInfo._id,
            username: partnerInfo.username,
            profile_picture: imageUrl(partnerInfo?.profile_picture)
        }

        const call_data = {
            partner,
            room_id: callInfo.conversation_id,
            call_id: callInfo._id,
            message_id: callInfo.message_id,
            conversation_id: callInfo.conversation_id,
        }
        return apiResponse(true, "Call data", call_data);
    }

    static callErrorResponse(message = "Server error!") {
        return apiResponse(false, message);
    }
}

module.exports = CallService;