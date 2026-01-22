const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// For Vercel, we need to handle Socket.IO differently
// This is a basic HTTP handler for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Chess server is running' });
});

app.get('/api/info', (req, res) => {
  res.status(200).json({ 
    name: 'Chess Web App',
    version: '1.0.0',
    description: 'Real-time multiplayer chess game'
  });
});

module.exports = app;
