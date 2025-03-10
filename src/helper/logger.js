import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';

const styles = {
    success: chalk.green.bold,
    error: chalk.red.bold,
    warning: chalk.yellow.bold, 
    info: chalk.blue.bold,
    highlight: chalk.magenta.bold,
    system: chalk.cyan.bold,
    time: chalk.gray.bold,
    connection: {
        connecting: chalk.blue.bold,
        connected: chalk.green.bold,
        disconnected: chalk.red.bold,
        pairing: chalk.yellow.bold
    }
};

const createBanner = (text) => {
    const banner = figlet.textSync(text, {
        font: 'ANSI Shadow',
        horizontalLayout: 'full'
    });
    const customGradient = gradient(['#FF0000', '#00FF00', '#0000FF', '#FF00FF']);
    return customGradient(banner);
};

const getTimestamp = () => {
    return new Date().toLocaleTimeString('id-ID', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const frames = [
    '⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'
];

const icons = {
    success: '✨',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    system: '⚙️',
    messageIn: '📥',
    messageOut: '📤',
    connecting: '🔌',
    connected: '✅',
    disconnected: '❗',
    pairing: '🔑'
};

export const logger = {
    success: (message) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.success} ${styles.success(message)}`);
    },
    error: (message, error = null) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.error} ${styles.error(message)}`);
        if (error) console.error(styles.error(error.stack || error));
    },
    warning: (message) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.warning} ${styles.warning(message)}`);
    },
    info: (message) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.info} ${styles.info(message)}`);
    },
    system: (message) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.system} ${styles.system(message)}`);
    },
    message: {
        in: (message) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.messageIn} ${styles.highlight(`Message: ${message}`)}`);
        },
        out: (message) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.messageOut} ${styles.highlight(`Message: ${message}`)}`);
        }
    },
    divider: () => {
        console.log(styles.system('━'.repeat(65)));
    },
    clear: () => {
        console.clear();
    },
    showBanner: () => {
        console.clear();
        console.log(createBanner('Kanata-V3'));
        logger.divider();
        logger.system('Bot sedang diinisialisasi...');
        logger.divider();
    },
    connection: {
        connecting: (message) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.connecting} ${styles.connection.connecting(message)}`);
        },
        connected: (message) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.connected} ${styles.connection.connected(message)}`);
        },
        disconnected: (message) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.disconnected} ${styles.connection.disconnected(message)}`);
        },
        pairing: (code) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${icons.pairing} Kode Pairing: ${styles.connection.pairing.bold(code)}`);
        }
    },
    progress: {
        start: (message) => {
            let i = 0;
            return setInterval(() => {
                process.stdout.write(`\r${styles.time(`[${getTimestamp()}]`)} ${frames[i]} ${message}`);
                i = (i + 1) % frames.length;
            }, 80);
        },
        stop: (interval) => {
            clearInterval(interval);
            process.stdout.write('\n');
        }
    }
};
