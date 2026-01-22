const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow connections from Vite dev server
        methods: ["GET", "POST"]
    }
});

let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('find_match', () => {
        if (waitingPlayer && waitingPlayer.id !== socket.id) {
            // Match found!
            console.log('Match found between', waitingPlayer.id, 'and', socket.id);

            // Randomize colors
            const rand = Math.random();
            const p1Color = rand > 0.5 ? 'white' : 'black';
            const p2Color = p1Color === 'white' ? 'black' : 'white';

            // Notify players
            waitingPlayer.emit('game_start', { color: p1Color, opponent: socket.id });
            socket.emit('game_start', { color: p2Color, opponent: waitingPlayer.id });

            // Store game room info if needed, for this simple version we can just rely on direct comms or rooms
            const roomId = waitingPlayer.id + '#' + socket.id;
            waitingPlayer.join(roomId);
            socket.join(roomId);

            waitingPlayer = null;
        } else {
            console.log('User joined waiting room:', socket.id);
            waitingPlayer = socket;
            socket.emit('waiting');
        }
    });

    socket.on('move', (moveData) => {
        // Broadcast move to everyone else in the room (which is just the opponent)
        // We need to know which room the socket is in.
        // Simple way: iterate rooms
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                socket.to(room).emit('opponent_move', moveData);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
        // Ideally notify opponent of disconnection
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
