import { checkOwner } from '../../helper/permission.js';
import { formatDate, formatFileSize } from '../../helper/formatter.js';
import { createReadStream, createWriteStream } from 'fs';
import { zip } from 'zip-a-folder';
import path from 'path';
import fs from 'fs';

export default async ({ sock, m, id, noTel }) => {
    try {
        if (!globalThis.isOwner(noTel)) return;

        // Buat folder backup jika belum ada
        const backupDir = './backups';
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        // Generate nama file backup
        const date = new Date();
        const timestamp = formatDate(date).replace(/ /g, '_');
        const dbBackupPath = path.join(backupDir, `db_backup_${timestamp}.zip`);

        // Copy database ke folder backup
        const dbPath = './database/kanata.db';
        if (!fs.existsSync(dbPath)) {
            throw new Error('Database file not found!');
        }

        // Buat temporary folder
        const tempDir = path.join(backupDir, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Copy database ke temp folder
        fs.copyFileSync(dbPath, path.join(tempDir, 'kanata.db'));

        // Zip folder
        await zip(tempDir, dbBackupPath);

        // Hapus temporary folder
        fs.rmSync(tempDir, { recursive: true, force: true });

        // Get file size
        const stats = fs.statSync(dbBackupPath);
        const fileSize = formatFileSize(stats.size);

        // Kirim file backup
        await sock.sendMessage(id, {
            document: createReadStream(dbBackupPath),
            fileName: path.basename(dbBackupPath),
            mimetype: 'application/zip',
            caption: `*📦 DATABASE BACKUP*\n\n` +
                    `📅 Tanggal: ${formatDate(date)}\n` +
                    `📊 Ukuran: ${fileSize}`
        });

        // Hapus file backup setelah dikirim
        fs.unlinkSync(dbBackupPath);

    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ Error: ${error.message}` 
        });
    }
};

export const handler = 'backupdb';
export const tags = ['owner'];
export const command = ['backupdb', 'dbbackup'];
export const help = 'Backup database\nPenggunaan: !backupdb'; 