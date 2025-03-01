import { checkOwner } from '../../helper/permission.js';
import { formatDate, formatFileSize } from '../../helper/formatter.js';
import { createReadStream } from 'fs';
import { zip } from 'zip-a-folder';
import path from 'path';
import fs from 'fs';

export default async ({ sock, m, id, noTel }) => {
    try {
        // Cek apakah user adalah owner
        if (!globalThis.isOwner(noTel)) return;

        // Buat folder backup jika belum ada
        const backupDir = './backups';
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        // Generate nama file backup
        const date = new Date();
        // console.log(formatDate(date).replace(/ /g, '_'))
        // return 
        const timestamp = formatDate(date).replace(/ /g, '_');
        const scBackupPath = path.join(backupDir, `sc_backup_${timestamp}.zip`);

        // List folder dan file yang akan dibackup
        const foldersToBackup = [
            'assets',
            'database',
            'helper',
            'lib',
            'plugins',
            'public'
        ];

        const filesToBackup = [
            'package.json',
            'app.js',
            'global.js',
            'index.html',
        ];

        // Buat temporary folder
        const tempDir = path.join(backupDir, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Copy folders
        for (const folder of foldersToBackup) {
            if (fs.existsSync(folder)) {
                fs.cpSync(folder, path.join(tempDir, folder), { recursive: true });
            }
        }

        // Copy files
        for (const file of filesToBackup) {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join(tempDir, file));
            }
        }

        // Hapus node_modules dan file database dari backup
        const excludeDirs = [
            path.join(tempDir, 'node_modules'),
            path.join(tempDir, 'database', 'kanata.db'),
            path.join(tempDir, '.git')
        ];

        for (const dir of excludeDirs) {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true });
            }
        }

        // Zip folder
        await zip(tempDir, scBackupPath);

        // Hapus temporary folder
        fs.rmSync(tempDir, { recursive: true, force: true });

        // Get file size
        const stats = fs.statSync(scBackupPath);
        const fileSize = formatFileSize(stats.size);

        // Kirim file backup
        await sock.sendMessage(id, {
            document: createReadStream(scBackupPath),
            fileName: path.basename(scBackupPath),
            mimetype: 'application/zip',
            caption: `*📦 SOURCE CODE BACKUP*\n\n` +
                `📅 Tanggal: ${formatDate(date)}\n` +
                `📊 Ukuran: ${fileSize}\n\n` +
                `📁 Folders: ${foldersToBackup.join(', ')}\n` +
                `📄 Files: ${filesToBackup.join(', ')}`
        });

        // Hapus file backup setelah dikirim
        fs.unlinkSync(scBackupPath);

    } catch (error) {
        await sock.sendMessage(id, {
            text: `❌ Error: ${error.stack}`
        });
        throw error
    }
};

export const handler = 'backupsc';
export const tags = ['owner'];
export const command = ['backupsc', 'scbackup'];
export const help = 'Backup source code\nPenggunaan: !backupsc'; 