const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
    sender: {
        type: String,
        tirm: true,
    },
    reciver: {
        type: String,
        tirm: true
    },
    messages: [{
        senderId: String,
        reciverID: String,
        message: String,

    }],
}, { timestamps: true });

const Msg = mongoose.model('message', msgSchema);

module.exports = { Msg };   