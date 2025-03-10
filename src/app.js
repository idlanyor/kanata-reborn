import '../global.js';
import { app, io, startServer } from './config/server.js';
import router from './routes/index.js';
import { startBot } from './services/botService.js';
import { logger } from './helper/logger.js';

// Gunakan router
app.use('/', router);

// Socket.IO event handlers
io.on('connection', (socket) => {
    logger.info('Client connected');

    socket.on('generateQR', async (phoneNumber) => {
        try {
            logger.info(`Received phone number: ${phoneNumber}`);
            await startBot(phoneNumber);
            io.emit('botStatus', {
                status: 'success',
                message: `Bot started successfully for number: ${phoneNumber}`
            });
        } catch (error) {
            logger.error('Failed to start bot:', error);
            io.emit('botStatus', {
                status: 'error',
                message: `Failed to start bot: ${error.message}`
            });
        }
    });

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

// Mulai server dan bot
startServer(3000)
    .then(() => startBot())
    .catch(error => {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }); 