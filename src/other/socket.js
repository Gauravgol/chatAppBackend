const io = require('../index')

let RoomName = null;

const initializ = io.of('api/chatsRoom');

initializ.on('connection', (socket) => {
    console.log('user connected to socket server: ', socket.id);
    RoomName = socket.id;
    let Sender = null;
    socket.on('currentUser', async (data) => {
        Sender = data?.data;
        const fetchUserList = await Msg.find({ "$or": [{ sender: Sender }, { reciver: Sender }] });
        socket.emit('fetchUserList', fetchUserList);
    });
})

const chatRoute = io.of('api/chat');

chatRoute.on('connection', (socket) => {
    console.log('a user connected: chatRoute: ', socket.id);

    socket.on('userEmail', async (user) => {
        const userData = await User.find({ email: user?.email })
        if (userData) {
            socket.emit('userData', { user: userData })
        }
    })

    socket.join('room');
    const messageData = async () => {
        try {
            return await Msg.find();
        } catch (error) {
            console.log('An error occurred: ', error);
            return [];
        }
    };

    const sendMessageData = async () => {
        const messages = await messageData();
        chatRoute.to('room').emit('msg', { data: messages });
    }

    sendMessageData()

    socket.on('message', async (data) => {
        const saveMessage = await Msg.create({ Messages: data });
        const messageData = await Msg.find();
        chatRoute.to('room').emit('msg', { data: messageData });
    })
    socket.on('disconnect', () => console.log('user disconnected', socket.id));

})

const IndividualChat = io.of('api/chat/user');

let NameOfRoom;

IndividualChat.on('connection', (socket) => {
    console.log('user connected: ', socket.id);

    socket.on('joinRoom', (data) => {
        const roomId = [data?.sender, data?.reciver].sort().join('&');
        socket.join(roomId);
        socket.roomId = roomId;
        console.log('user joined room successfully')
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

    socket.on('disconnect', () => console.log('user disconnected', socket.id));
})

