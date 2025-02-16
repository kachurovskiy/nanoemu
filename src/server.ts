import WebSocket, { WebSocketServer } from 'ws';
import Controller from './controller';
import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';

const app = express();
const wss = new WebSocketServer({ port: 81 });
const controller = new Controller();

console.log("Lathe WebSocket server running on ws://localhost:81");

wss.on('connection', (ws: WebSocket) => {
  console.log("Client connected");

  ws.on('message', (message: WebSocket.RawData) => {
    const command = message.toString().trim();
    console.log("Received:", command);

    let response = controller.processCommand(command);
    if (response) ws.send(response + "\n");
  });

  ws.on('close', () => {
    console.log("Client disconnected");
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/status', (req: Request, res: Response) => {
  const freeSpace = controller.getFreeSpace();
  res.status(200).send(`LittleFS.freeSpace=${freeSpace}`);
});

app.post('/gcode/add', (req: Request, res: Response) => {
  const { name, gcode } = req.body;
  if (controller.saveGcode(name, gcode)) {
    res.status(200).send("G-code saved successfully");
  } else {
    res.status(500).send("Failed to save G-code");
  }
});

app.get('/gcode/list', (req: Request, res: Response) => {
  const gcodes = controller.listGcodes().join('\n');
  res.status(200).send(gcodes || "");
});

app.get('/gcode/get', (req: Request, res: Response) => {
  const { name } = req.query;
  const gcode = controller.getGcode(name as string);
  if (gcode) {
    res.status(200).send(gcode);
  } else {
    res.status(404).send("G-code file not found");
  }
});

app.post('/gcode/remove', (req: Request, res: Response) => {
  const { name } = req.body;
  if (controller.removeGcode(name)) {
    res.status(200).send("G-code removed successfully");
  } else {
    res.status(500).send("Failed to remove G-code");
  }
});

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).send();
});

const server = http.createServer(app);

server.listen(82, () => {
  console.log("Lathe HTTP server running on http://localhost:82");
});
