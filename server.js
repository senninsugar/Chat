const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

const users = new Map();

io.on('connection', (socket) => {
    socket.on('join', (nickname) => {
        users.set(socket.id, { 
            id: socket.id, 
            nickname, 
            avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${nickname}` 
        });
        io.emit('user list', Array.from(users.values()));
    });

    socket.on('chat message', (msg) => {
        const user = users.get(socket.id);
        if (user) {
            io.emit('chat message', {
                ...user,
                text: msg,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now()
            });
        }
    });

    socket.on('disconnect', () => {
        users.delete(socket.id);
        io.emit('user list', Array.from(users.values()));
    });
});

http.listen(3000, () => console.log('Discord Pro running on http://localhost:3000'));
