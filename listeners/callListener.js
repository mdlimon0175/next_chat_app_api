const Call = require('../models/Call');
const User = require('../models/User');
const Message = require('../models/Message');

const logger = require('../logger');
const callStatus = require('../enum/callStatus');
const { apiResponse } = require('../helper/helper');
const CallService = require('../services/CallService');

/**
* @note on callEndHandler we can handle error if failed to call end
*/

function callListener(io, socket) {
    socket.on('call_outgoing', async room_id => {
        try {
            const callService = new CallService();
            const existCall = await callService.findExistCall(socket.user._id);

            if(existCall) {
                if(existCall.conversation_id.equals(room_id)) {
                    socket.join(room_id);
                }
                return socket.emit('rejoin_exist_call', apiResponse(
                    false,
                    'Rejoin existing call!',
                    {
                        exist: true,
                        room_id: existCall.conversation_id
                    }
                ));
            }

            const user_id = socket.user._id;
            const conversation = await callService.findConversationByIdAndUserId(
                room_id,
                user_id
            );
            if(!conversation) {
                return socket.emit('call_error', CallService.callErrorResponse('Invalid request!'));
            }

            const { conversation_id, partner } = conversation;
            const { _id: partner_id, username: partner_username } = partner;

            const newMessage = new Message({
                sender_id: user_id,
                receiver_id: partner_id,
                conversation_id,
                sent_at: new Date()
            })
            await newMessage.save();

            const callInfo = new Call({
                conversation_id,
                message_id: newMessage._id,
                participants: [user_id, partner_id]
            });

            const isPartnerOnline = io.sockets.adapter.rooms.has(partner_id.toString());
            if(!isPartnerOnline) {
                await callService.updateCallInfo(callInfo);
                return socket.emit('call_end', apiResponse(false, `${partner_username} is offline`));
            }

            const partnerExistCall = await callService.findExistCall(partner_id);

            if(partnerExistCall) {
                await callService.updateCallInfo(callInfo);
                return socket.emit('call_end', apiResponse(
                    false,
                    `${partner_username} in another call`
                ));
            }

            const timeout = 10000;
            io.to(partner_id.toString())
            .timeout(timeout)
            .emit('call_incoming', apiResponse(true, 'Incoming call', {
                timeout,
                room_id,
                from: socket.user.username
            }), async (err, res) => {
                const [data = {}] = res || [];
                // if err - user not responded the call
                // if not then can be user received or decline the call which decide by res.status.
                if(err || data?.error) {
                    await callService.updateCallInfo(callInfo);
                    return socket.emit('call_end', apiResponse(
                        false,
                        `${partner_username} not responded`
                    ));
                }
                if(!data.status) {
                    await callService.updateCallInfo(callInfo, callStatus.DECLINED);
                    return socket.emit('call_end', apiResponse(false, 'Call declined'));
                }

                await callInfo.save();
                socket.join(room_id);
                const { socket_id } = data.data;
                socket.emit('call_data', CallService.callDataResponse(callInfo, partner));
                return io.to(socket_id).emit('call_data', CallService.callDataResponse(callInfo, socket.user));
            })
        } catch(error) {
            logger.error("Failed to call", {
                error_message: error.message,
                stack: error.stack
            });
            return socket.emit('call_error', apiResponse(
                false,
                'Server error!',
            ));
        }
    })

    socket.on('call_joined', async ({ caller_id, call_id }) => {
        try {
            const callInfo = await Call.findOne({
                _id: call_id,
                participants: {$all: [socket.user._id, caller_id]},
                ended_at: null
            });

            if(!callInfo) {
                return socket.emit('call_error', CallService.callErrorResponse('Invalid request!'));
            }

            const room_id = callInfo.conversation_id.toString();
            if(callInfo.status === callStatus.STARTED) {
                const roomMembers = await socket.in(room_id).fetchSockets();
                const socketPartner = roomMembers.find(s => s.id !== socket.id);
                if(!socketPartner) {
                    await CallService.callEndHandler(callInfo);
                    return socket.emit('call_end', apiResponse(true, "Call end"));
                }

                socket.join(room_id);
                socket.emit('call_data', CallService.callDataResponse(callInfo, socketPartner.user));
                return socket.to(room_id).emit('rejoin_exist_call', apiResponse(
                    false,
                    'Rejoin existing call!',
                    {
                        exist: true,
                        room_id
                    },
                ));
            }

            callInfo.started_at = new Date();
            callInfo.status = callStatus.STARTED;
            await callInfo.save();
            socket.join(room_id);
            return socket.to(room_id).emit('callee_joined', apiResponse(true, 'Callee joined the call'));
        } catch(error) {
            logger.error("Callee failed to joined the call", {
                error_message: error.message,
                stack: error.stack
            });
            return socket.emit('call_error', apiResponse(
                false,
                'Server error!',
            ));
        }
    })

    socket.on('call_offer_sdp', async ({room_id, offer, rejoin = false}) => {
        try {
            const callInfo = await Call.findOne({
                ended_at: null,
                conversation_id: room_id,
                status: callStatus.STARTED,
                participants: { $in: [socket.user._id] },
            });

            if(!callInfo) {
                return socket.emit('call_error', CallService.callErrorResponse('Invalid request!'))
            }

            if(rejoin) {
                const roomMembers = await socket.in(room_id).fetchSockets();
                const socketPartner = roomMembers.find(s => s.id !== socket.id);
                if(!socketPartner) {
                    await CallService.callEndHandler(callInfo);
                    return socket.emit('call_end', apiResponse(true, "Call end"));
                }

                socket.emit('call_data', CallService.callDataResponse(callInfo, socketPartner.user));
            }

            return socket
            .to(room_id)
            .timeout(5000)
            .emit(!rejoin ? 'caller_offer_sdp' : 'caller_rejoin_offer_sdp', apiResponse(
                true,
                !rejoin ? 'Caller offer sdp' : 'Caller rejoin offer sdp',
                {offer}
            ), async (err, res) => {
                const [data = {}] = res || [];
                if(err) {
                    await CallService.callEndHandler(callInfo);

                    const partner_id = callInfo.participants.find(p => !p._id.equals(socket.user._id));
                    const partner = await User.findById(partner_id).select('username').lean();
                    return socket.emit('call_end', apiResponse(
                        false,
                        `${partner.username} disconnected`
                    ));
                }
                return socket.emit('callee_answer_sdp', apiResponse(
                    true,
                    'Callee answer sdp',
                    {answer: data}
                ))
            });
        } catch(error) {
            logger.error("Failed to send call offer sdp", {
                error_message: error.message,
                stack: error.stack
            });
            return socket.emit('call_error', CallService.callErrorResponse());
        }
    })

    socket.on('call_hangup', async call_id => {
        try {
            const callInfo = await Call.findOne({
                _id: call_id,
                participants: {$in: [socket.user._id]},
                status: callStatus.STARTED,
                ended_at: null
            });

            if(!callInfo) {
                return socket.emit('call_error', CallService.callErrorResponse('Invalid request!'));
            }

            await CallService.callEndHandler(callInfo);
            const room_id = callInfo.conversation_id.toString();
            io.to(room_id).emit('call_end', apiResponse(true, "Call end"));
            return io.socketsLeave(room_id);
        } catch(error) {
            logger.error("Failed hangup the call", {
                error_message: error.message,
                stack: error.stack
            });
            return socket.emit('call_error', CallService.callErrorResponse());
        }
    })

    socket.on('ice_candidate', async ({ call_id, room_id, candidate }) => {
        try {
            const callInfo = await Call.findOne({
                _id: call_id,
                participants: {$in: [socket.user._id]},
                conversation_id: room_id,
                status: callStatus.STARTED,
                ended_at: null
            }).select('_id').lean();

            /**
            * @note we can inform client and partner 
            * about ice_candidate failed status
            */
            if(!callInfo) return;

            return socket.to(room_id).emit('ice_candidate', apiResponse(true, 'ice_candidate', { candidate }));
        } catch(error) {
            logger.error("Failed exchange ice candidate", {
                error_message: error.message,
                stack: error.stack
            });
        }
    })

    socket.on('call_toggle_stream', async({ stream_type, stream_status, call_id, room_id }) => {
        const call = Call.findOne({
            _id: call_id,
            conversation_id: room_id,
            participants: {$in: [socket.user._id]},
            status: callStatus.STARTED,
            ended_at: null
        }).select('_id').lean();

        if(!call) {
            return socket.emit('call_end', apiResponse(false, "Call end"))
        }

        const emit_event = `call_remote_${stream_type === 'video' ? 'video' : 'audio'}_stream_toggled`
        socket
        .to(room_id)
        .emit(emit_event, apiResponse(true, "Remote Stream toggled", { status: stream_status }));
    })
}

module.exports = callListener;