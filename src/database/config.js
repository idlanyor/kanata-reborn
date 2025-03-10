import sqlite3 from 'sqlite3';
import RPG from './models/RPG.js';
import pkg from 'sqlite3';
const { open } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'kanata.db');

// Buat koneksi database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeTables();
    }
});

// Inisialisasi tabel-tabel
function initializeTables() {
    try {
        db.serialize(async () => {
            // Tabel users
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone TEXT UNIQUE,
                name TEXT,
                is_admin BOOLEAN DEFAULT 0,
                exp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                last_daily DATETIME,
                total_messages INTEGER DEFAULT 0,
                total_commands INTEGER DEFAULT 0,
                join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            // tabel menfess
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                sender_id TEXT NOT NULL,
                receiver_id TEXT DEFAULT 0,
                message TEXT NOT NULL,
                is_anonymous INTEGER DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Tabel plugins
            db.run(`CREATE TABLE IF NOT EXISTS plugins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                path TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Tabel sessions
            db.run(`DROP TABLE IF EXISTS sessions`);
            db.run(`CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE,
                session_data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Tabel commands
            db.run(`CREATE TABLE IF NOT EXISTS commands (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                command TEXT UNIQUE,
                plugin_id INTEGER,
                description TEXT,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (plugin_id) REFERENCES plugins (id)
            )`);

            // Drop tabel lama jika perlu diupdate strukturnya
            db.run(`DROP TABLE IF EXISTS rpg_stats`);

            // Buat tabel rpg_stats dengan struktur lengkap
            db.run(`CREATE TABLE IF NOT EXISTS rpg_stats (
                user_id TEXT PRIMARY KEY,
                level INTEGER DEFAULT 1,
                exp INTEGER DEFAULT 0,
                health INTEGER DEFAULT 100,
                max_health INTEGER DEFAULT 100,
                mana INTEGER DEFAULT 50,
                max_mana INTEGER DEFAULT 50,
                energy INTEGER DEFAULT 100,
                hunger INTEGER DEFAULT 100,
                thirst INTEGER DEFAULT 100,
                strength INTEGER DEFAULT 10,
                defense INTEGER DEFAULT 5,
                agility INTEGER DEFAULT 5,
                gold INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Tambahkan fungsi initPlayer jika belum ada
            RPG.initPlayer = function(userId) {
                return new Promise((resolve, reject) => {
                    db.run(`INSERT OR IGNORE INTO rpg_stats (user_id) VALUES (?)`, [userId], (err) => {
                        if (err) {
                            console.error('Error initializing player:', err);
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });
            };

            // Tabel Inventory
            db.run(`CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                item_id INTEGER,
                quantity INTEGER DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES rpg_stats (user_id),
                FOREIGN KEY (item_id) REFERENCES items (id)
            )`);

            // Tabel Items
            db.run(`CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                type TEXT,
                rarity TEXT,
                price INTEGER,
                effect TEXT,
                description TEXT
            )`);

            // Tabel untuk AFK
            db.run(`CREATE TABLE IF NOT EXISTS afk_status (
                user_id TEXT PRIMARY KEY,
                reason TEXT,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                mentioned_by TEXT,
                FOREIGN KEY (user_id) REFERENCES users (phone)
            )`);

            // Tabel untuk pengaturan grup
            db.run(`CREATE TABLE IF NOT EXISTS group_settings (
                group_id TEXT PRIMARY KEY,
                welcome BOOLEAN DEFAULT false,
                goodbye BOOLEAN DEFAULT false,
                antilink BOOLEAN DEFAULT false,
                antispam BOOLEAN DEFAULT false,
                antitoxic BOOLEAN DEFAULT false,
                only_admin BOOLEAN DEFAULT false,
                welcome_message TEXT,
                goodbye_message TEXT,
                autoai BOOLEAN DEFAULT false
            )`);

            // Cek apakah kolom autoai sudah ada
            db.all("PRAGMA table_info(group_settings)", (err, rows) => {
                if (err) {
                    console.error('Error checking columns:', err);
                    return;
                }
                
                // Jika kolom autoai belum ada, tambahkan
                if (!rows.some(row => row.name === 'autoai')) {
                    db.run("ALTER TABLE group_settings ADD COLUMN autoai BOOLEAN DEFAULT false", (err) => {
                        if (err) {
                            console.error('Error adding autoai column:', err);
                        } else {
                            console.log('Added autoai column successfully');
                        }
                    });
                }
            });

            // Tabel untuk spam detection
            db.run(`CREATE TABLE IF NOT EXISTS spam_detection (
                user_id TEXT,
                group_id TEXT,
                message_count INTEGER DEFAULT 0,
                last_message DATETIME,
                warning_count INTEGER DEFAULT 0,
                PRIMARY KEY (user_id, group_id)
            )`);

            // Tabel untuk jadibot sessions
            db.run(`CREATE TABLE IF NOT EXISTS jadibot_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                session_id TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                is_active BOOLEAN DEFAULT true
            )`);

            // Tabel untuk sewa bot
            db.run(`CREATE TABLE IF NOT EXISTS bot_rentals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT UNIQUE,
                renter_id TEXT,
                plan_type TEXT,
                start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_date DATETIME,
                is_active BOOLEAN DEFAULT true,
                payment_status TEXT DEFAULT 'pending'
            )`);

            // Tabel untuk harga sewa
            db.run(`CREATE TABLE IF NOT EXISTS rental_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plan_name TEXT UNIQUE,
                duration_days INTEGER,
                price INTEGER,
                features TEXT
            )`);

            // Insert default rental plans
            db.run(`INSERT OR REPLACE INTO rental_plans (plan_name, duration_days, price, features) VALUES 
                ('Basic', 30, 10000, '["antilink", "welcome", "antispam"]'),
                ('Premium', 30, 25000, '["antilink", "welcome", "antispam", "antitoxic", "games"]'),
                ('Permanent', 999999, 100000, '["all features"]')`);

            // Tabel untuk dungeon
            db.run(`CREATE TABLE IF NOT EXISTS dungeons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                min_level INTEGER,
                hp INTEGER,
                attack INTEGER,
                defense INTEGER,
                exp_reward INTEGER,
                gold_reward INTEGER,
                item_drops TEXT,
                cooldown_minutes INTEGER
            )`);

            // Tabel untuk history dungeon
            db.run(`CREATE TABLE IF NOT EXISTS dungeon_history (
                user_id TEXT,
                dungeon_id INTEGER,
                last_enter DATETIME,
                PRIMARY KEY (user_id, dungeon_id),
                FOREIGN KEY (user_id) REFERENCES rpg_stats(user_id),
                FOREIGN KEY (dungeon_id) REFERENCES dungeons(id)
            )`);

            // Tabel untuk skill
            db.run(`CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                type TEXT,
                effect TEXT,
                mana_cost INTEGER,
                cooldown_seconds INTEGER,
                min_level INTEGER,
                price INTEGER
            )`);

            // Tabel user skills
            db.run(`CREATE TABLE IF NOT EXISTS user_skills (
                user_id TEXT,
                skill_id INTEGER,
                last_used DATETIME,
                FOREIGN KEY(user_id) REFERENCES rpg_stats(user_id),
                FOREIGN KEY(skill_id) REFERENCES skills(id),
                PRIMARY KEY(user_id, skill_id)
            )`);

            // Tabel untuk quest
            db.run(`CREATE TABLE IF NOT EXISTS quests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                description TEXT,
                type TEXT,
                target_amount INTEGER,
                exp_reward INTEGER,
                gold_reward INTEGER,
                item_reward TEXT,
                min_level INTEGER
            )`);

            // Tabel user quests
            db.run(`CREATE TABLE IF NOT EXISTS user_quests (
                user_id TEXT,
                quest_id INTEGER,
                progress INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT 0,
                FOREIGN KEY(user_id) REFERENCES rpg_stats(user_id),
                FOREIGN KEY(quest_id) REFERENCES quests(id),
                PRIMARY KEY(user_id, quest_id)
            )`);

            // Insert default dungeons
            db.get('SELECT COUNT(*) as count FROM dungeons', [], (err, row) => {
                if (err || row.count > 0) return;

                const defaultDungeons = [
                    ['Goa Goblin', 1, 100, 10, 5, 50, 100, '{"Wooden Sword":0.3,"Health Potion":0.5}', 30],
                    ['Hutan Troll', 5, 200, 20, 10, 100, 200, '{"Iron Sword":0.2,"Leather Armor":0.4}', 45],
                    ['Menara Penyihir', 10, 400, 35, 20, 200, 400, '{"Magic Staff":0.1,"Mana Potion":0.6}', 60]
                ];

                const stmt = db.prepare(`INSERT INTO dungeons 
                    (name, min_level, hp, attack, defense, exp_reward, gold_reward, item_drops, cooldown_minutes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                    
                defaultDungeons.forEach(dungeon => stmt.run(dungeon));
                stmt.finalize();
            });

            // Insert default skills
            db.run(`INSERT OR REPLACE INTO skills 
                (name, type, effect, mana_cost, cooldown_seconds, min_level, price) VALUES 
                ('Heal', 'support', '{"health": 100}', 30, 60, 1, 1000),
                ('Fireball', 'attack', '{"damage": 150}', 50, 30, 5, 2000),
                ('Shield', 'defense', '{"defense": 50}', 40, 90, 3, 1500),
                ('Ultimate Attack', 'attack', '{"damage": 300}', 100, 180, 10, 5000)`
            );

            // Insert default quests
            db.run(`INSERT OR REPLACE INTO quests 
                (name, description, type, target_amount, exp_reward, gold_reward, item_reward, min_level) VALUES 
                ('Beginner Hunter', 'Hunt 5 times', 'hunt', 5, 500, 300, '{"Health Potion": 2}', 1),
                ('Master Scavenger', 'Mulung 10 times', 'mulung', 10, 800, 500, '{"Lucky Charm": 1}', 3),
                ('Dungeon Explorer', 'Complete 3 dungeons', 'dungeon', 3, 2000, 1000, '{"Rare Weapon": 1}', 5)`
            );

            // Tabel untuk party
            db.run(`CREATE TABLE IF NOT EXISTS parties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                leader_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Tabel untuk member party
            db.run(`CREATE TABLE IF NOT EXISTS party_members (
                party_id INTEGER,
                user_id TEXT,
                role TEXT,
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (party_id, user_id)
            )`);

            // Tabel untuk recipe crafting
            db.run(`CREATE TABLE IF NOT EXISTS recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_name TEXT,
                materials TEXT,
                level_required INTEGER,
                success_rate INTEGER
            )`);

            // Tabel untuk pet
            db.run(`CREATE TABLE IF NOT EXISTS pets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                type TEXT,
                base_stats TEXT
            )`);

            // Tabel untuk pet user
            db.run(`CREATE TABLE IF NOT EXISTS user_pets (
                user_id TEXT,
                pet_id INTEGER,
                level INTEGER DEFAULT 1,
                exp INTEGER DEFAULT 0,
                happiness INTEGER DEFAULT 100,
                is_active INTEGER DEFAULT 1,
                PRIMARY KEY (user_id, pet_id)
            )`);

            // Insert scrap items
            db.get('SELECT COUNT(*) as count FROM items WHERE type = "scrap"', [], (err, row) => {
                if (err || row.count > 0) return;

                const scrapItems = [
                    ['Botol Plastik', 'scrap', 'common', 50, null, 'Botol plastik bekas yang bisa didaur ulang'],
                    ['Kardus Bekas', 'scrap', 'common', 75, null, 'Kardus bekas yang masih bisa dijual'],
                    ['Kaleng Bekas', 'scrap', 'common', 100, null, 'Kaleng bekas berbagai ukuran'],
                    ['Besi Berkarat', 'scrap', 'uncommon', 150, null, 'Potongan besi bekas yang berkarat'],
                    ['Kabel Bekas', 'scrap', 'uncommon', 200, null, 'Kabel-kabel bekas berbagai ukuran'],
                    ['Elektronik Rusak', 'scrap', 'rare', 500, null, 'Barang elektronik rusak yang masih bisa dijual']
                ];

                const stmt = db.prepare('INSERT INTO items (name, type, rarity, price, effect, description) VALUES (?, ?, ?, ?, ?, ?)');
                scrapItems.forEach(item => stmt.run(item));
                stmt.finalize();
            });

            // Insert shop items
            db.get('SELECT COUNT(*) as count FROM items', [], (err, row) => {
                if (err || row.count > 0) return;

                const shopItems = [
                    // Senjata
                    ['Wooden Sword', 'weapon', 'common', 500, '{"attack":5}', 'Pedang kayu untuk pemula'],
                    ['Iron Sword', 'weapon', 'uncommon', 1500, '{"attack":15}', 'Pedang besi standar'],
                    ['Steel Sword', 'weapon', 'rare', 5000, '{"attack":30}', 'Pedang baja berkualitas tinggi'],
                    
                    // Armor
                    ['Leather Armor', 'armor', 'common', 800, '{"defense":8}', 'Armor kulit untuk pemula'],
                    ['Iron Armor', 'armor', 'uncommon', 2000, '{"defense":20}', 'Armor besi standar'],
                    ['Steel Armor', 'armor', 'rare', 6000, '{"defense":35}', 'Armor baja yang kuat'],
                    
                    // Makanan
                    ['Roti', 'food', 'common', 50, '{"hunger":20,"energy":10}', 'Roti segar untuk mengisi energi'],
                    ['Daging Bakar', 'food', 'uncommon', 150, '{"hunger":40,"energy":25}', 'Daging bakar yang lezat'],
                    ['Sup Special', 'food', 'rare', 300, '{"hunger":60,"energy":40,"health":20}', 'Sup bergizi tinggi'],
                    
                    // Minuman
                    ['Air Mineral', 'drink', 'common', 30, '{"thirst":20,"energy":5}', 'Air mineral segar'],
                    ['Jus Buah', 'drink', 'uncommon', 100, '{"thirst":35,"energy":15}', 'Jus buah segar'],
                    ['Energy Drink', 'drink', 'rare', 200, '{"thirst":30,"energy":50}', 'Minuman berenergi tinggi'],
                    
                    // Ramuan
                    ['Health Potion', 'potion', 'common', 100, '{"health":50}', 'Pemulih HP standar'],
                    ['Mana Potion', 'potion', 'common', 100, '{"mana":50}', 'Pemulih MP standar'],
                    ['Max Potion', 'potion', 'rare', 500, '{"health":100,"mana":100}', 'Pemulih HP & MP maksimal'],
                    
                    // Peralatan
                    ['Fishing Rod', 'tool', 'common', 1000, null, 'Alat pancing untuk mencari ikan'],
                    ['Mining Pick', 'tool', 'common', 1000, null, 'Alat tambang untuk menggali ore'],
                    ['Hunting Bow', 'tool', 'uncommon', 2000, null, 'Busur untuk berburu'],
                    
                    // Material Crafting
                    ['Wood', 'material', 'common', 50, null, 'Kayu untuk crafting'],
                    ['Iron Ore', 'material', 'uncommon', 200, null, 'Bijih besi untuk crafting'],
                    ['Magic Crystal', 'material', 'rare', 1000, null, 'Kristal ajaib untuk crafting']
                ];

                const stmt = db.prepare('INSERT INTO items (name, type, rarity, price, effect, description) VALUES (?, ?, ?, ?, ?, ?)');
                shopItems.forEach(item => stmt.run(item));
                stmt.finalize();
            });

            // Initialize default items
            try {
                await RPG.initializeDefaultItems();
                console.log('Items initialized successfully');
            } catch (error) {
                console.error('Error initializing items:', error);
            }
        });

        // Tambah items baru
        const newItems = [
            ['Nasi', 'food', 'common', 50, '{"hunger": 30, "energy": 10}', 'Nasi putih yang mengenyangkan'],
            ['Air Mineral', 'drink', 'common', 20, '{"thirst": 30, "energy": 5}', 'Air mineral segar'],
            ['Roti', 'food', 'common', 30, '{"hunger": 20, "energy": 8}', 'Roti tawar'],
            ['Kopi', 'drink', 'common', 40, '{"thirst": 20, "energy": 15}', 'Kopi hitam'],
            ['Lockpick', 'tool', 'rare', 1000, '{"steal_bonus": 10}', 'Alat untuk mencuri'],
            ['Sarung Tangan', 'tool', 'common', 500, '{"scavenge_bonus": 5}', 'Sarung tangan untuk memulung']
        ];

        db.get('SELECT COUNT(*) as count FROM items WHERE type IN ("food", "drink", "tool")', [], (err, row) => {
            if (err) {
                console.error('Error checking items:', err);
                return;
            }

            if (row.count === 0) {
                const stmt = db.prepare('INSERT INTO items (name, type, rarity, price, effect, description) VALUES (?, ?, ?, ?, ?, ?)');
                newItems.forEach(item => stmt.run(item));
                stmt.finalize();
            }
        });

    } catch (error) {
        console.error('Error initializing tables:', error);
    }
}

// Fungsi untuk membersihkan sessions yang tidak valid
export const cleanSessions = () => {
    return new Promise((resolve, reject) => {
        try {
            db.run(`DELETE FROM sessions WHERE session_data IS NULL`, [], (err) => {
                if (err) reject(err);
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Update fungsi untuk menyimpan session
export const saveSession = (sessionId, sessionData) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO sessions (session_id, session_data) VALUES (?, ?)`,
            [sessionId, JSON.stringify(sessionData)],
            (err) => {
                if (err) reject(err);
                resolve();
            });
    });
};

// Fungsi untuk mendapatkan session
export const getSession = (sessionId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT session_data FROM sessions WHERE session_id = ?`,
            [sessionId],
            (err, row) => {
                if (err) reject(err);
                resolve(row ? JSON.parse(row.session_data) : null);
            });
    });
};

export default db;