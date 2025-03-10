import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../helper/logger.js';
import net from 'net';

// Setup Express dan Socket.IO
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
});

// Setup path
const _dirname = dirname(fileURLToPath(import.meta.url));
const __dirname = dirname(_dirname);

// Setup middleware dasar
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// Fungsi untuk memulai server
function startServer(port = 3000) {
    return new Promise((resolve, reject) => {
        try {
            server.listen(port, '0.0.0.0', () => {
                console.log(`Server running at http://0.0.0.0:${port}`);
                resolve(port);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export { app, server, io, __dirname, startServer }; 