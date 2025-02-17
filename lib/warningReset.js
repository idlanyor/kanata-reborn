import { readFileSync, writeFileSync } from 'fs';
import cron from 'node-cron';

const WARNING_FILES = [
    'lib/database/toxic_warnings.json',
    'lib/database/promo_warnings.json',
    'lib/database/link_warnings.json',
    'lib/database/spam_warnings.json'
];

// Reset warnings setiap hari jam 00:00
export const startWarningReset = () => {
    cron.schedule('0 0 * * *', () => {
        WARNING_FILES.forEach(file => {
            try {
                writeFileSync(file, '{}', 'utf8');
                console.log(`Reset warnings for ${file}`);
            } catch (error) {
                console.error(`Error resetting warnings for ${file}:`, error);
            }
        });
    });
}; 