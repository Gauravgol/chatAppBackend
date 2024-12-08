require('dotenv').config({path: '.env'});
const express = require('express');
const Router = require('./src/router/router')
const bodyParser = require('body-parser');
const cors = require('cors');
require('./src/db/db.connection');
const ErrorHandler = require('./src/middleware/ErrorHandler')
const { createServer } = require('http');
const { Server } = require('socket.io');
const { User } = require('./src/models/userSchema');
const { Msg } = require('./src/models/msgSchems');
const { groupChat } = require('./src/models/Group_chat_schema')

const app = express();
const corsOptions = {
    origin: '*',  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
 
  };
  
  app.use(cors(corsOptions));
app.use(cors());
app.use(bodyParser.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { origin: '*' }
});

// initialize socket for previous chat list 

const initializ = io.of('api/init');

initializ.on('connection', (socket) => {
    console.log('user connected to socket server: ', socket.id);

    socket.on('currentUser', async (data) => {
        const fetchUserList = await Msg.find({ "$or": [{ sender: data?.sender }, { reciver: data?.sender }] });
        socket.emit('fetchUserList', fetchUserList);
        const roomListData = await groupChat.find();
        socket.emit('roomList', roomListData);
    });

    socket.on('newRoom', async (data) => {
        const createNewRoom = await groupChat.create({
            room_name: data?.roomName,
            users: [
                {
                    user_name: data?.creater,
                    email: data?.creater,
                    createdAt: Date.now(),
                }
            ],
            messages: [],
        });
        console.log(createNewRoom);
    })

})

// group chat 

const chatRoute = io.of('api/chat/groups');

chatRoute.on('connection', (socket) => {
    console.log('a user connected: chatRoute: ', socket.id);

    socket.on('joinRoom', (data) => {
        socket.join(data?.roomId);
        socket.roomId = data?.roomId;
        console.log('user connected to room: ', socket.roomId);
    });

    socket.on("fetchRoomMessage", async () => {
        const roomData = await groupChat.find({ room_name: socket?.roomId });
        if (roomData) {
            chatRoute.to(socket?.roomId).emit('fetcher', roomData);
        }
    });

    socket.on('sendMessage', async (data) => {
        console.log(data)
        const addMessage = await groupChat.findOneAndUpdate({ "$and": [{ room_name: data?.roomName }, { "users.email": data?.user?.email }] }, {
            "$push": {
                messages: {
                    sender: data?.user?.email,
                    message: data?.message,
                    createdAr: data?.time
                }
            }
        }, { new: true });

        if (!addMessage) {
            const addMsgWithUser = await groupChat.findOneAndUpdate({ room_name: data?.roomName }, {
                "$push": {
                    users: {
                        user_name: data?.user?.name,
                        email: data?.user?.email,
                        createdAt: data?.time
                    },
                    messages: {
                        sender: data?.user?.email,
                        message: data?.message,
                        createdAr: data?.time
                    }
                }
            }, { new: true });
        }
    });

    socket.on('leaveRoom', () => {
        socket.leave(socket.roomId);
        socket.roomId = null;
    });

    socket.on('disconnect', () => console.log('user disconnected', socket.id));

})

// individual chat 

const IndividualChat = io.of('api/chat/individual');

IndividualChat.on('connection', (socket) => {
    console.log('user connected: ', socket.id);

    socket.on('joinRoom', (data) => {
        const roomId = [data?.sender, data?.reciver].sort().join('&');
        console.log(socket.roomId === roomId);
        if (socket.roomId === roomId) {
            socket.join(roomId);
        } else {
            socket.leave(socket.roomId);
            socket.join(roomId);
            socket.roomId = roomId;
        }

        console.log('user joined room successfully', roomId)
    });

    socket.on('reciverUser', async (data) => {
        const reciver = await User.find({ email: data?.reciver });
        socket.receiverEmail = reciver[0]?.email
        socket.emit('reciverUserData', { data: reciver });
    })

    socket.on('fetchData', async (data) => {
        const roomId = [data?.sender, data?.reciver].sort().join('&');
        if (socket.roomId === roomId) {
            console.log(socket.roomId === roomId);
            const msgData = await Msg.find({ "$or": [{ sender: data?.sender, reciver: data?.reciver }, { sender: data?.reciver, reciver: data?.sender }] });
            IndividualChat.to(socket.roomId).emit('messageData', { data: msgData, roomId: socket.roomId });
        } else {
            console.log('data is not available');
        }
    });

    socket.on('sendMessage', async (data) => {
        const message = {
            senderId: data?.sender,
            reciverID: data?.reciver,
            message: data?.data
        }

        const user = await Msg.findOneAndUpdate({ "$or": [{ sender: data?.sender, reciver: data?.reciver }, { sender: data?.reciver, reciver: data?.sender }] }, { "$push": { messages: message } });
        if (!user) {
            const messageCreate = await Msg.create({
                sender: data?.sender,
                reciver: data?.reciver,
                messages: message
            });
        }

    });

    socket.on('leaveRoom', () => {
        socket.leave(socket.roomId);
        console.log('user left room successfully: ', socket.roomId);
        socket.roomId = null;
    })

    socket.on('disconnect', () => console.log('user disconnected', socket.id));
})


app.use('/', Router);

app.use(ErrorHandler);
console.log(process.env.PORT);

httpServer.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`));

