const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenBlacklistSchema = new Schema({
    token: { type: String, required: true },
    expire_at: { type: Date, required: true },
    blacklisted_at: { type: Date, default: null }
});

TokenBlacklistSchema.index({ expire_at: 1 }, { expireAfterSeconds: 0 });

const TokenBlacklist = mongoose.model("TokenBlacklist", TokenBlacklistSchema);
module.exports = TokenBlacklist;