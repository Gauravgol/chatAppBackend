const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        tirm: true
    },
    username: {
        type: String,
        unique: true,
        tirm: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "Please enter a valid email address"],
    },
    mobile_number: {
        type: Number,
        unique: true,
        tirm: true,
        required: [true, "Please enter a valid mobile number"],
    },
    DOB: {
        type: String,
        unique: true,
        tirm: true,
        required: [true, "Please enter a valid date"],
    },
    password: {
        type: String,
        trim: true,
        required: [true, "Please enter a valid password"],
    },
}, { timestamps: true }
)

const User = mongoose.model('user', userSchema);

module.exports = { User };
