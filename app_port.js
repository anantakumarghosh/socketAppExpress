const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const net = require('net');

const PYTHON_HOST = '192.168.29.104';
const EXPRESS_HOST = '192.168.29.104';
const EXPRESS_PORT = 4000; // Express.js server port
const PYTHON_PORT = 5000;  // Python server port

app.use(bodyParser.text());

// Route for the homepage
app.get('/', (req, res) => {
  res.send('Welcome to the Express.js Application');
});

// Route to send a message to Python
app.get('/send/:data', async (req, res) => {
  try {
    // let message = req.body;
    let respose = await sendToPython(req.params.data);
    res.status(200).send('Message sent to Python successfully. \n ' + respose);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    res.status(500).send('Error sending message to Python.');
  }
});

// Route to gracefully shut down the server
app.post('/shutdown', (req, res) => {
  console.log('Server is shutting down...');
  res.status(200).send('Server is shutting down...');
  // Close the server and perform any cleanup if needed
  server.close(() => {
    console.log('Server has been shut down.');
    process.exit(0);
  });
});

let server = app.listen(EXPRESS_PORT, EXPRESS_HOST, () => {
  console.log(`Express server is running on http://${EXPRESS_HOST}:${EXPRESS_PORT}`);
});

async function sendToPython(message) {
  return new Promise((resolve, reject) => {
    let client = new net.Socket();

    client.connect(PYTHON_PORT, PYTHON_HOST, () => { // Connect to the Python server on PYTHON_PORT
      console.log('Connected to Python server');

      // Send data to Python
      client.write(message);
    });

    // Handle incoming data from Python once
    client.once('data', (data) => {
      console.log(`Received data from Python: ${data.toString()}`);
      // Close the connection after receiving data
      client.end(() => {
        console.log('Connection closed');
        resolve(data.toString());
      });
    });

    client.on('error', (err) => {
      console.error(`Error: ${err.message}`);
      reject(err);
    });
  });
}
