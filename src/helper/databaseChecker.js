import db from '../database/config.js';


export const checkAndInitDatabase = () => {
    return new Promise((resolve, reject) => {
        try {
            // Cek dan buat tabel yang diperlukan
            db.serialize(() => {
                // RPG Tables
                db.run(`CREATE TABLE IF NOT EXISTS rpg_stats (
                    user_id TEXT PRIMARY KEY,
                    level INTEGER DEFAULT 1,
                    exp INTEGER DEFAULT 0,
                    health INTEGER DEFAULT 100,
                    mana INTEGER DEFAULT 50,
                    strength INTEGER DEFAULT 10,
                    defense INTEGER DEFAULT 5,
                    gold INTEGER DEFAULT 0
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS inventory (
                    user_id TEXT,
                    item_name TEXT,
                    quantity INTEGER DEFAULT 0,
                    PRIMARY KEY (user_id, item_name)
                )`);

                // Dungeon Tables
                db.run(`CREATE TABLE IF NOT EXISTS dungeons (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    min_level INTEGER,
                    hp INTEGER,
                    attack INTEGER,
                    defense INTEGER,
                    exp_reward INTEGER,
                    gold_reward INTEGER,
                    item_drops TEXT,
                    cooldown_minutes INTEGER
                )`);

                // Skills Tables
                db.run(`CREATE TABLE IF NOT EXISTS skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    type TEXT,
                    effect TEXT,
                    mana_cost INTEGER,
                    cooldown_seconds INTEGER,
                    min_level INTEGER,
                    price INTEGER
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS user_skills (
                    user_id TEXT,
                    skill_id INTEGER,
                    last_used DATETIME,
                    PRIMARY KEY(user_id, skill_id)
                )`);

                // Quest Tables
                db.run(`CREATE TABLE IF NOT EXISTS quests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    description TEXT,
                    type TEXT,
                    target_amount INTEGER,
                    exp_reward INTEGER,
                    gold_reward INTEGER,
                    item_reward TEXT,
                    min_level INTEGER
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS user_quests (
                    user_id TEXT,
                    quest_id INTEGER,
                    progress INTEGER DEFAULT 0,
                    completed INTEGER DEFAULT 0,
                    PRIMARY KEY(user_id, quest_id)
                )`);

                // AFK Table
                db.run(`CREATE TABLE IF NOT EXISTS afk_status (
                    user_id TEXT PRIMARY KEY,
                    reason TEXT,
                    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    mentioned_by TEXT
                )`);

                // Group Settings Table
                db.run(`CREATE TABLE IF NOT EXISTS group_settings (
                    group_id TEXT PRIMARY KEY,
                    antilink INTEGER DEFAULT 0,
                    welcome INTEGER DEFAULT 1,
                    goodbye INTEGER DEFAULT 1,
                    antispam INTEGER DEFAULT 0,
                    antitoxic INTEGER DEFAULT 0,
                    only_admin INTEGER DEFAULT 0,
                    welcome_message TEXT,
                    goodbye_message TEXT
                )`);

                // Bot Settings Tables
                db.run(`CREATE TABLE IF NOT EXISTS jadibot_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    session_id TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME,
                    is_active INTEGER DEFAULT 1
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS bot_rentals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    group_id TEXT,
                    renter_id TEXT,
                    plan_type TEXT,
                    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    end_date DATETIME,
                    is_active INTEGER DEFAULT 1,
                    payment_status TEXT DEFAULT 'pending'
                )`);
            });

            console.log('✅ Database checked and initialized successfully');
            resolve();
        } catch (error) {
            console.error('❌ Error initializing database:', error);
            reject(error);
        }
    });
};

export const initializeDefaultData = () => {
    return new Promise((resolve, reject) => {
        try {
            db.serialize(() => {
                // Check and insert default dungeons
                db.get("SELECT COUNT(*) as count FROM dungeons", [], (err, row) => {
                    if (err) throw err;
                    if (row.count === 0) {
                        const stmt = db.prepare(`INSERT INTO dungeons 
                            (name, min_level, hp, attack, defense, exp_reward, gold_reward, item_drops, cooldown_minutes) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                            
                        stmt.run('Goblin Cave', 5, 500, 50, 30, 1000, 500, 
                            '{"Goblin Sword": 0.3, "Health Potion": 0.5}', 30);
                        stmt.run('Dragon Lair', 15, 2000, 150, 100, 5000, 2000,
                            '{"Dragon Scale": 0.2, "Rare Sword": 0.1}', 60);
                        stmt.run('Demon Castle', 30, 5000, 300, 200, 10000, 5000,
                            '{"Demon Crown": 0.05, "Legendary Armor": 0.08}', 120);
                        stmt.finalize();
                    }
                });

                // Check and insert default skills
                db.get("SELECT COUNT(*) as count FROM skills", [], (err, row) => {
                    if (err) throw err;
                    if (row.count === 0) {
                        const stmt = db.prepare(`INSERT INTO skills 
                            (name, type, effect, mana_cost, cooldown_seconds, min_level, price) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)`);
                            
                        stmt.run('Heal', 'support', '{"health": 100}', 30, 60, 1, 1000);
                        stmt.run('Fireball', 'attack', '{"damage": 150}', 50, 30, 5, 2000);
                        stmt.run('Shield', 'defense', '{"defense": 50}', 40, 90, 3, 1500);
                        stmt.run('Ultimate Attack', 'attack', '{"damage": 300}', 100, 180, 10, 5000);
                        stmt.finalize();
                    }
                });

                // Check and insert default quests
                db.get("SELECT COUNT(*) as count FROM quests", [], (err, row) => {
                    if (err) throw err;
                    if (row.count === 0) {
                        const stmt = db.prepare(`INSERT INTO quests 
                            (name, description, type, target_amount, exp_reward, gold_reward, item_reward, min_level) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
                            
                        stmt.run('Beginner Hunter', 'Hunt 5 times', 'hunt', 5, 500, 300, 
                            '{"Health Potion": 2}', 1);
                        stmt.run('Master Scavenger', 'Mulung 10 times', 'mulung', 10, 800, 500,
                            '{"Lucky Charm": 1}', 3);
                        stmt.run('Dungeon Explorer', 'Complete 3 dungeons', 'dungeon', 3, 2000, 1000,
                            '{"Rare Weapon": 1}', 5);
                        stmt.finalize();
                    }
                });
            });

            console.log('✅ Default data initialized successfully');
            resolve();
        } catch (error) {
            console.error('❌ Error initializing default data:', error);
            reject(error);
        }
    });
};