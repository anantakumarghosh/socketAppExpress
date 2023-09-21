// app.js
const express = require('express');
const net = require('net');
const readline = require('readline');
const app = express();

// Create a socket server
const server = net.createServer((socket) => {
  console.log('Client connected');

  // Handle incoming data from the Python program
  socket.on('data', (data) => {
    const receivedMessage = data.toString();
    console.log('Received data from Python:', receivedMessage);

    // Modify the message (e.g., add a prefix)
    const modifiedMessage = `Modified by Express.js: ${receivedMessage}`;

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

  // Create a CLI interface for sending messages from Express.js
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt('Enter a message to send to Python (or type "exit" to quit): ');
  rl.prompt();

  rl.on('line', (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      process.exit(0);
    } else {
      // Send the input message to the Python program
      server.connections.forEach((socket) => {
        socket.write(input);
      });
    }
    rl.prompt();
  });
});

// Start the socket server
server.listen(4000, () => {
  console.log('Socket server is listening on port 4000');
});
