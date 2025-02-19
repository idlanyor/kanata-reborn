import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';

const styles = {
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow,
    info: chalk.blue,
    highlight: chalk.magenta,
    system: chalk.cyan,
    time: chalk.gray,
    connection: {
        connecting: chalk.blue,
        connected: chalk.green,
        disconnected: chalk.red,
        pairing: chalk.yellow
    }
};

const createBanner = (text) => {
    const banner = figlet.textSync(text, {
        font: '3D-ASCII',
        horizontalLayout: 'full'
    });
    return gradient.rainbow(banner);
};

const getTimestamp = () => {
    return new Date().toLocaleTimeString();
};
const frames = [
    '▰▱▱▱▱▱▱▱',
    '▰▰▱▱▱▱▱▱',
    '▰▰▰▱▱▱▱▱',
    '▰▰▰▰▱▱▱▱',
    '▰▰▰▰▰▱▱▱',
    '▰▰▰▰▰▰▱▱',
    '▰▰▰▰▰▰▰▱',
    '▰▰▰▰▰▰▰▰'
];

export const logger = {
    success: (message) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.success('✓')} ${styles.success(message)}`);
    },
    error: (message, error = null) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.error('✗')} ${styles.error(message)}`);
        if (error) console.error(styles.error(error.stack || error));
    },
    warning: (message) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.warning('⚠')} ${styles.warning(message)}`);
    },
    info: (message) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.info('ℹ')} ${styles.info(message)}`);
    },
    system: (message) => {
        console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.system('⚙')} ${styles.system(message)}`);
    },
    message: {
        in: (message) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.highlight('←')} ${styles.highlight(`Message: ${message}`)}`);
        },
    },
    divider: () => {
        console.log(styles.system('━'.repeat(50)));
    },
    clear: () => {
        console.clear();
    },
    showBanner: () => {
        console.clear();
        console.log(createBanner('Kanata-V3'));
        logger.divider();
        logger.system('Bot is initializing...');
        logger.divider();
    },
    connection: {
        connecting: (message) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.connection.connecting('🔌')} ${styles.connection.connecting(message)}`);
        },
        connected: (message) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.connection.connected('✅')} ${styles.connection.connected(message)}`);
        },
        disconnected: (message) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.connection.disconnected('⚠️')} ${styles.connection.disconnected(message)}`);
        },
        pairing: (code) => {
            console.log(`${styles.time(`[${getTimestamp()}]`)} ${styles.connection.pairing('🔑')} Pairing Code: ${styles.connection.pairing.bold(code)}`);
        }
    },
    progress: {
        start: (message) => {
            let i = 0;
            return setInterval(() => {
                process.stdout.write(`\r${styles.time(`[${getTimestamp()}]`)} ${frames[i]} ${message}`);
                i = (i + 1) % frames.length;
            }, 100);
        },
        stop: (interval) => {
            clearInterval(interval);
            process.stdout.write('\n');
        }
    }
};

