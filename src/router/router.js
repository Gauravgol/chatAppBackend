const express = require('express');
const { registerUser, loginUser, users, updateUser, deleteUser } = require('../controller/userController');
// const { chatRoom } = require('../socket/socket');

const router = express.Router();

router.post('/api/register', registerUser)

router.post('/api/login', loginUser);

router.route('/api/users').get(users).patch(updateUser).delete(deleteUser);



module.exports = router;