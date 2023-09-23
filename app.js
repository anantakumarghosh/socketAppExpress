const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const net = require('net');

const PYTHON_HOST = '127.0.0.1'; // System IP address
const PYTHON_PORT = 5000;  // Python Socket Listening port
const EXPRESS_HOST = '127.0.0.1'; // System IP
const EXPRESS_PORT = 4001; // Express App server port
const EXPRESS_SOCKET_PORT = 4000;
app.use(bodyParser.text());

app.get('/', (req, res) => {
  res.send('Welcome to the Express.js Application');
});

app.get('/send', async (req, res) => {
  try {
    let message = req.query.data;

    // Create a socket connection to the Python server
    const client = new net.Socket();
    writeMessageToPython(client, message);

    client.on('data', (data) => {
      console.log(`Received data from Python socket Server: ${data.toString()}`);
      
      // Close the socket connection to Python
      client.end();

      // Send the received data as a response to the client
      res.status(200).send(`Message sent to Python socket successfully via GET request throught socket.\nReceived data: ${data}`);
    });
    
    client.on('error', (err) => {
      console.error(`Error: ${err.message}`);
      res.status(500).send('Error sending message to Python.');
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    res.status(500).send('Error sending message to Python.');
  }
});

let server = app.listen(EXPRESS_PORT, EXPRESS_HOST, () => {
  console.log(`Express server is running on http://${EXPRESS_HOST}:${EXPRESS_PORT}`);
});

const socket_server = net.createServer((socket) => {
  // Get the client's IP address
  let clientAddress = socket.remoteAddress;
  
  // Get the client's port
  let clientPort = socket.remotePort;       

  console.log(`Client connected from ${clientAddress}:${clientPort}`);
  // Handle incoming data from the Python program
  socket.on('data', (data) => {
    let receivedMessage = data.toString();
    console.log('Received data from Python Client Socket:', receivedMessage);

    let modifiedMessage = `${receivedMessage} MODIFIED`;
    console.log('Sending modified data:', modifiedMessage);
    
    // Send the modified message back to Python
    socket.write(modifiedMessage);
  });
  
  // Handle client disconnect
  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

socket_server.listen(EXPRESS_SOCKET_PORT, () => {
  console.log('Socket server is listening on port ' + EXPRESS_SOCKET_PORT);
});

function writeMessageToPython(client, message){
  client.connect(PYTHON_PORT, PYTHON_HOST, () => {
    console.log(`Connected to Python server at ${PYTHON_HOST}:${PYTHON_PORT}`);
    
    // Send data to the Python server
    client.write(message);
    client.end();
  });
}
