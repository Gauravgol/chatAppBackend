const mongoose = require('mongoose')

const ChatSchema = mongoose.Schema({
    room_name: {
        type: String,
        tirm: true,
    },
    users: [
        {
            user_name: String,
            email: String,
            createdAt: Date,
        }
    ],
    messages: [
        {
            sender: String,
            message: String,
            createdAt: Date,
        }
    ]
}, { timestamps: true });

const groupChat = mongoose.model('group', ChatSchema);

module.exports = { groupChat };