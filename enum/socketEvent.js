const socketEvents = Object.freeze({
    CALL_END: "call_end",
    CALL_DATA: "call_data",
    CALL_ERROR: "call_error",
    REJOIN_EXIST_CALL: "rejoin_exist_call",
    // CALL_HANGUP: "call_hangup",
    // CALL_JOINED: "call_joined",
    // ICE_CANDIDATE: "ice_candidate",
    // CALL_OUTGOING: "call_outgoing",
    // CALL_INCOMING: "call_incoming",
    // CALLEE_JOINED: "callee_joined",
    // CALL_OFFER_SDP: "call_offer_sdp",
    // CALLER_OFFER_SDP: "caller_offer_sdp",
    // CALLEE_ANSWER_SDP: "callee_answer_sdp",
    // CALLER_REJOIN_OFFER_SDP: "caller_rejoin_offer_sdp",
});

module.exports = socketEvents;