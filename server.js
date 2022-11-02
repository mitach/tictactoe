const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
app.use('/', express.static('static'));
const server = http.createServer(app);
const io = socketIO(server);

const rooms = {};

io.on('connect', socket => {
    socket.on('selectRoom', roomId => {
        console.log(roomId);

        if (rooms[roomId] == undefined) {
            rooms[roomId] = new Map();
        }

        const players = rooms[roomId];

        if (players.size >= 2) {
            socket.emit('error', 'Room is full!');
            socket.disconnect();
        } else {
            socket.join(roomId);
            initGame(roomId, players, socket);
        }
    });
});

function initGame(roomId, players, socket) {
    let symbol = 'X';

    if (players.size > 0) {
        const otherSymbol = [...players.values()][0];
        if (otherSymbol == 'X') {
            symbol = 'O';
        }
    }

    players.set(socket, symbol);
    socket.emit('symbol', symbol);

    socket.on('position', pos => {
        console.log('Position:', pos);
        io.to(roomId).emit('position', pos);
    });

    socket.on('newGame', () => {
        console.log('New game initited');
        io.to(roomId).emit('newGame');
    });

    socket.on('message', message => {
        io.to(roomId).emit('message', {source: symbol, message});
    });

    socket.on('disconnect', () => {
        console.log('Player left');
        players.delete(socket);
    });
}

server.listen(3000, () => console.log('Server listening on port 3000'));