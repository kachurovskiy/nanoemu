"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const controller_1 = __importDefault(require("./controller"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const wss = new ws_1.WebSocketServer({ port: 81 });
const controller = new controller_1.default();
console.log("Lathe WebSocket server running on ws://localhost:81");
wss.on('connection', (ws) => {
    console.log("Client connected");
    ws.on('message', (message) => {
        const command = message.toString().trim();
        console.log("Received:", command);
        let response = controller.processCommand(command);
        if (response)
            ws.send(response + "\n");
    });
    ws.on('close', () => {
        console.log("Client disconnected");
    });
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.post('/gcode/add', (req, res) => {
    const { name, gcode } = req.body;
    if (controller.saveGcode(name, gcode)) {
        res.status(200).send("G-code saved successfully");
    }
    else {
        res.status(500).send("Failed to save G-code");
    }
});
app.get('/gcode/list', (req, res) => {
    const gcodes = controller.listGcodes().join('\n');
    res.status(200).send(gcodes || "");
});
app.get('/gcode/get', (req, res) => {
    const { name } = req.query;
    const gcode = controller.getGcode(name);
    if (gcode) {
        res.status(200).send(gcode);
    }
    else {
        res.status(404).send("G-code file not found");
    }
});
app.post('/gcode/remove', (req, res) => {
    const { name } = req.body;
    if (controller.removeGcode(name)) {
        res.status(200).send("G-code removed successfully");
    }
    else {
        res.status(500).send("Failed to remove G-code");
    }
});
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'index.html'));
});
app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
});
const server = http_1.default.createServer(app);
server.listen(82, () => {
    console.log("Lathe HTTP server running on http://localhost:82");
});
