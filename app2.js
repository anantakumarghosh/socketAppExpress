// app.js
const express = require('express');
const net = require('net');
const app = express();

// Create a socket server
const server = net.createServer((socket) => {
  console.log('Client connected');

  // Handle incoming data from the Python program
  socket.on('data', (data) => {
    let receivedMessage = data.toString();
    console.log('Received data from Python:', receivedMessage);

    // Modify the message (e.g., add a prefix)
    let modifiedMessage = `Modified by Express.js: ${receivedMessage}`;

    // Send the modified message back to Python
    socket.write(modifiedMessage);
  });

  // Handle client disconnect
  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Express.js Server');
});

// Start the Express.js server
app.listen(PORT, () => {
  console.log(`Express.js server is listening on port ${PORT}`);
});

// Start the socket server
server.listen(4000, () => {
  console.log('Socket server is listening on port 4000');
});
