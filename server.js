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
const roomMetadata = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('find_match', () => {
        if (waitingPlayer && waitingPlayer.id !== socket.id) {
            // Match found!
            console.log('Match found between', waitingPlayer.id, 'and', socket.id);

            const rand = Math.random();
            const p1Color = rand > 0.5 ? 'white' : 'black';
            const p2Color = p1Color === 'white' ? 'black' : 'white';

            const roomId = waitingPlayer.id + '#' + socket.id;
            waitingPlayer.join(roomId);
            socket.join(roomId);

            waitingPlayer.emit('game_start', { color: p1Color, opponent: socket.id, roomId });
            socket.emit('game_start', { color: p2Color, opponent: waitingPlayer.id, roomId });

            waitingPlayer = null;
        } else {
            waitingPlayer = socket;
            socket.emit('waiting');
        }
    });

    socket.on('cancel_matchmaking', () => {
        if (waitingPlayer && waitingPlayer.id === socket.id) {
            waitingPlayer = null;
            console.log('User cancelled matchmaking:', socket.id);
            // Optionally notify user connection was cancelled if needed, but client usually knows
        }
    });

    socket.on('create_room', ({ color }) => {
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Default to random if invalid color provided
        const validColors = ['white', 'black', 'random'];
        const hostColorPref = validColors.includes(color) ? color : 'random';

        roomMetadata.set(roomCode, { hostColor: hostColorPref });

        socket.join(roomCode);
        socket.emit('room_created', { roomCode });
        console.log(`Room created: ${roomCode} by ${socket.id} with color pref: ${hostColorPref}`);
    });

    socket.on('join_room', (roomCode) => {
        const room = io.sockets.adapter.rooms.get(roomCode);
        const metadata = roomMetadata.get(roomCode);

        if (room && room.size === 1) {
            socket.join(roomCode);

            // Determine colors based on host preference
            let p1Color = 'white';
            let p2Color = 'black';

            // metadata should exist, but handle edge case
            const hostPref = metadata ? metadata.hostColor : 'random';

            if (hostPref === 'white') {
                p1Color = 'white';
                p2Color = 'black';
            } else if (hostPref === 'black') {
                p1Color = 'black';
                p2Color = 'white';
            } else {
                // Random
                const rand = Math.random();
                p1Color = rand > 0.5 ? 'white' : 'black';
                p2Color = p1Color === 'white' ? 'black' : 'white';
            }

            // Clean up metadata as it's no longer needed after start
            roomMetadata.delete(roomCode);

            // Get the first client (host) in the room
            // Note: 'room' is a Set of socket IDs. socket.join appends so the first one is likely host.
            // But we should be careful. 'room' iterator gives IDs.
            // The NEW joiner is 'socket'. The EXISTING one is the host.
            let hostId = null;
            for (const id of room) {
                if (id !== socket.id) {
                    hostId = id;
                    break;
                }
            }

            const hostClient = io.sockets.sockets.get(hostId);

            if (hostClient) {
                hostClient.emit('game_start', { color: p1Color, opponent: socket.id, roomCode });
                socket.emit('game_start', { color: p2Color, opponent: hostId, roomCode });
                console.log(`User ${socket.id} joined room ${roomCode}. Game started.`);
            }
        } else if (room && room.size >= 2) {
            socket.emit('error_message', 'Room is full');
        } else {
            socket.emit('error_message', 'Room not found');
        }
    });

    socket.on('move', (moveData) => {
        // Broadcast to all rooms the socket is in (except its own ID room)
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                socket.to(room).emit('opponent_move', moveData);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
