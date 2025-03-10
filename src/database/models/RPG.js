import db from '../config.js';
import moment from 'moment';
import User from './User.js';

class RPG {
    static async initPlayer(userId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM rpg_stats WHERE user_id = ?', [userId], (err, row) => {
                if (err) {
                    console.error('Error checking player:', err);
                    reject(err);
                    return;
                }
                
                if (!row) {
                    // Inisialisasi player baru
                    const defaultStats = {
                        level: 1,
                        exp: 0,
                        max_exp: 100,
                        health: 100,
                        max_health: 100,
                        mana: 50,
                        max_mana: 50,
                        stamina: 100,
                        max_stamina: 100,
                        hunger: 100,
                        thirst: 100,
                        energy: 100,
                        attack: 10,
                        defense: 5,
                        gold: 1000
                    };

                    db.run(`INSERT INTO rpg_stats (
                        user_id, level, exp, max_exp, health, max_health,
                        mana, max_mana, stamina, max_stamina, hunger, thirst,
                        energy, attack, defense, gold
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userId,
                        defaultStats.level,
                        defaultStats.exp,
                        defaultStats.max_exp,
                        defaultStats.health,
                        defaultStats.max_health,
                        defaultStats.mana,
                        defaultStats.max_mana,
                        defaultStats.stamina,
                        defaultStats.max_stamina,
                        defaultStats.hunger,
                        defaultStats.thirst,
                        defaultStats.energy,
                        defaultStats.attack,
                        defaultStats.defense,
                        defaultStats.gold
                    ], (err) => {
                        if (err) {
                            console.error('Error creating player:', err);
                            reject(err);
                            return;
                        }
                        resolve(defaultStats);
                    });
                } else {
                    resolve(row);
                }
            });
        });
    }

    static async getStats(userId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM rpg_stats WHERE user_id = ?', [userId], (err, row) => {
                if (err) {
                    console.error('Error getting stats:', err);
                    reject(err);
                    return;
                }
                if (!row) {
                    reject(new Error('Player tidak ditemukan!'));
                    return;
                }
                resolve(row);
            });
        });
    }

    static async hunt(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const now = new Date();
                const lastHunt = stats.last_hunt ? new Date(stats.last_hunt) : new Date(0);
                
                // Cooldown 5 menit
                if (now - lastHunt < 300000) {
                    reject(new Error(`Tunggu ${Math.ceil((300000 - (now - lastHunt)) / 1000)} detik lagi`));
                    return;
                }

                // Generate random rewards
                const goldEarned = Math.floor(Math.random() * 100) + 50;
                const expEarned = Math.floor(Math.random() * 50) + 25;
                const healthLost = Math.floor(Math.random() * 20) + 5;

                // Update stats
                db.run(`UPDATE rpg_stats SET 
                    gold = gold + ?,
                    health = CASE 
                        WHEN health - ? <= 0 THEN 1 
                        ELSE health - ? 
                    END,
                    last_hunt = CURRENT_TIMESTAMP 
                    WHERE user_id = ?`,
                [goldEarned, healthLost, healthLost, userId],
                async (err) => {
                    if (err) reject(err);
                    
                    // Add exp
                    const expResult = await User.addExp(userId, expEarned);
                    
                    resolve({
                        goldEarned,
                        expEarned,
                        healthLost,
                        levelUp: expResult.levelUp,
                        newLevel: expResult.newLevel
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async heal(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const now = new Date();
                const lastHeal = stats.last_heal ? new Date(stats.last_heal) : new Date(0);
                
                // Cooldown 3 menit
                if (now - lastHeal < 180000) {
                    reject(new Error(`Tunggu ${Math.ceil((180000 - (now - lastHeal)) / 1000)} detik lagi`));
                    return;
                }

                const healAmount = 30;
                
                db.run(`UPDATE rpg_stats SET 
                    health = CASE 
                        WHEN health + ? > max_health THEN max_health 
                        ELSE health + ? 
                    END,
                    last_heal = CURRENT_TIMESTAMP 
                    WHERE user_id = ?`,
                [healAmount, healAmount, userId],
                (err) => {
                    if (err) reject(err);
                    resolve(healAmount);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getInventory(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    i.quantity as inv_quantity,
                    i.item_id,
                    items.* 
                FROM inventory i 
                JOIN items ON i.item_id = items.id 
                WHERE i.user_id = ? AND i.quantity > 0
                ORDER BY items.type, items.name
            `;
            
            db.all(query, [userId], (err, rows) => {
                if (err) {
                    console.error('Error in getInventory:', err);
                    reject(err);
                    return;
                }
                
                // Transform rows to match expected format
                const inventory = rows.map(row => ({
                    ...row,
                    quantity: row.inv_quantity
                }));
                
                resolve(inventory);
            });
        });
    }

    static async useItem(userId, itemName) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await this.getItemByName(itemName);
                if (!item) {
                    reject(new Error('Item tidak ditemukan'));
                    return;
                }

                const effect = JSON.parse(item.effect);
                let updateQuery = 'UPDATE rpg_stats SET ';
                const updateValues = [];

                if (effect.health) {
                    updateQuery += 'health = CASE WHEN health + ? > max_health THEN max_health ELSE health + ? END, ';
                    updateValues.push(effect.health, effect.health);
                }
                if (effect.mana) {
                    updateQuery += 'mana = CASE WHEN mana + ? > max_mana THEN max_mana ELSE mana + ? END, ';
                    updateValues.push(effect.mana, effect.mana);
                }

                updateQuery = updateQuery.slice(0, -2); // Remove last comma
                updateQuery += ' WHERE user_id = ?';
                updateValues.push(userId);

                db.run(updateQuery, updateValues, (err) => {
                    if (err) reject(err);
                    resolve(effect);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async scavenge(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Inisialisasi player jika belum ada
                await this.initPlayer(userId);

                // Cek stats player
                const stats = await this.getStats(userId);
                if (stats.energy < 10) {
                    throw new Error('Energi tidak cukup! Minimal butuh 10 energi');
                }

                // Definisi item rongsokan yang bisa ditemukan
                const scrapItems = [
                    { name: 'Botol Plastik', value: 50, weight: 30 },
                    { name: 'Kardus Bekas', value: 75, weight: 25 },
                    { name: 'Kaleng Bekas', value: 100, weight: 20 },
                    { name: 'Besi Berkarat', value: 150, weight: 15 },
                    { name: 'Kabel Bekas', value: 200, weight: 10 },
                    { name: 'Elektronik Rusak', value: 500, weight: 5 }
                ];

                // Tentukan berapa item yang ditemukan (1-4 item)
                const itemCount = Math.floor(Math.random() * 4) + 1;
                let items = [];
                let totalValue = 0;

                // Pilih item berdasarkan weight
                for (let i = 0; i < itemCount; i++) {
                    const roll = Math.random() * 100;
                    let cumWeight = 0;
                    
                    for (const item of scrapItems) {
                        cumWeight += item.weight;
                        if (roll <= cumWeight) {
                            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
                            
                            // Cek apakah item ada di database
                            const dbItem = await this.getItemByName(item.name);
                            if (dbItem) {
                                items.push({
                                    name: item.name,
                                    quantity: quantity
                                });
                                totalValue += item.value * quantity;
                            }
                            break;
                        }
                    }
                }

                // Kurangi energi
                const energyLost = 10;
                await db.run(`UPDATE rpg_stats SET 
                    energy = CASE WHEN energy - ? < 0 THEN 0 ELSE energy - ? END,
                    gold = gold + ?
                    WHERE user_id = ?`,
                [energyLost, energyLost, totalValue, userId]);

                // Tambahkan items ke inventory
                for (const item of items) {
                    await this.addItem(userId, item.name, item.quantity);
                }

                // Tambah exp (50-100 exp random)
                const expGained = Math.floor(Math.random() * 51) + 50;
                const expResult = await this.addExp(userId, expGained);

                resolve({
                    items,
                    totalValue,
                    energyLost,
                    levelUp: expResult.levelUp,
                    newLevel: expResult.newLevel
                });

            } catch (error) {
                console.error('Error in scavenge:', error);
                reject(error);
            }
        });
    }

    static async steal(userId, targetId) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const targetStats = await this.getStats(targetId);
                
                if (!targetStats) {
                    reject(new Error('Target tidak ditemukan'));
                    return;
                }

                const now = new Date();
                const lastSteal = stats.last_steal ? new Date(stats.last_steal) : new Date(0);
                
                // Cooldown 10 menit
                if (now - lastSteal < 600000) {
                    reject(new Error(`Tunggu ${Math.ceil((600000 - (now - lastSteal)) / 1000)} detik lagi`));
                    return;
                }

                if (stats.jail_time && new Date(stats.jail_time) > now) {
                    reject(new Error('Kamu masih di penjara!'));
                    return;
                }

                // 40% chance to fail and go to jail
                if (Math.random() < 0.4) {
                    const jailTime = new Date(now.getTime() + 300000); // 5 menit di penjara
                    db.run(`UPDATE rpg_stats SET 
                        jail_time = ? 
                        WHERE user_id = ?`,
                    [jailTime.toISOString(), userId]);
                    reject(new Error('Kamu tertangkap dan dipenjara selama 5 menit!'));
                    return;
                }

                const stolenAmount = Math.floor(targetStats.gold * 0.1); // Steal 10% of target's gold
                
                db.run(`UPDATE rpg_stats SET 
                    gold = gold + ?,
                    last_steal = CURRENT_TIMESTAMP 
                    WHERE user_id = ?`,
                [stolenAmount, userId]);

                db.run(`UPDATE rpg_stats SET 
                    gold = gold - ? 
                    WHERE user_id = ?`,
                [stolenAmount, targetId]);

                resolve(stolenAmount);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async eat(userId, foodNumber) {
        return new Promise(async (resolve, reject) => {
            try {
                // Cek apakah foodMap ada
                if (!global.foodMap) {
                    throw new Error('Silakan cek makanan dulu dengan !makan');
                }

                // Ambil makanan dari foodMap
                const foodData = global.foodMap.get(parseInt(foodNumber));
                if (!foodData) {
                    throw new Error('Nomor makanan tidak valid!');
                }

                // Cek inventory
                const inventory = await this.getInventory(userId);
                const hasFood = inventory.find(i => i.id === foodData.id);

                if (!hasFood || hasFood.quantity < 1) {
                    throw new Error(`Kamu tidak punya ${foodData.name}!`);
                }

                // Dapatkan efek makanan
                const effect = JSON.parse(foodData.effect || '{}');

                // Mulai transaksi
                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION');

                    // Update stats player
                    db.run(`UPDATE rpg_stats SET 
                        hunger = MIN(hunger + ?, 100),
                        energy = MIN(energy + ?, 100),
                        health = MIN(health + ?, max_health)
                        WHERE user_id = ?`,
                    [
                        effect.hunger || 0,
                        effect.energy || 0,
                        effect.health || 0,
                        userId
                    ]);

                    // Kurangi item dari inventory
                    db.run(
                        `UPDATE inventory SET quantity = quantity - 1 
                        WHERE user_id = ? AND item_id = ?`,
                        [userId, foodData.id]
                    );

                    // Hapus item jika quantity 0
                    db.run(
                        `DELETE FROM inventory 
                        WHERE user_id = ? AND item_id = ? AND quantity <= 0`,
                        [userId, foodData.id]
                    );

                    db.run('COMMIT', (err) => {
                        if (err) {
                            console.error('Transaction error:', err);
                            db.run('ROLLBACK');
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });

                resolve(effect);

            } catch (error) {
                console.error('Error in eat:', error);
                reject(error);
            }
        });
    }

    static async drink(userId, drinkNumber) {
        return new Promise(async (resolve, reject) => {
            try {
                // Cek apakah drinkMap ada
                if (!global.drinkMap) {
                    throw new Error('Silakan cek minuman dulu dengan !minum');
                }

                const drinkData = global.drinkMap.get(parseInt(drinkNumber));
                if (!drinkData) {
                    console.log('Available drinks:', global.drinkMap);
                    throw new Error('Nomor minuman tidak valid! Ketik !minum untuk melihat daftar minuman.');
                }

                // Cek inventory
                const inventory = await this.getInventory(userId);
                const hasDrink = inventory.find(i => i.name === drinkData.name && i.type === 'drink');

                if (!hasDrink || hasDrink.quantity < 1) {
                    throw new Error(`Kamu tidak punya ${drinkData.name}!`);
                }

                // Dapatkan efek minuman
                const effect = JSON.parse(drinkData.effect || '{}');

                // Mulai transaksi
                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION');

                    // Update stats player
                    db.run(`UPDATE rpg_stats SET 
                        thirst = MIN(thirst + ?, 100),
                        energy = MIN(energy + ?, 100),
                        mana = MIN(mana + ?, max_mana)
                        WHERE user_id = ?`,
                    [
                        effect.thirst || 0,
                        effect.energy || 0,
                        effect.mana || 0,
                        userId
                    ]);

                    // Kurangi item dari inventory
                    db.run(
                        `UPDATE inventory SET quantity = quantity - 1 
                        WHERE user_id = ? AND item_id = ?`,
                        [userId, hasDrink.item_id]
                    );

                    // Hapus item jika quantity 0
                    db.run(
                        `DELETE FROM inventory 
                        WHERE user_id = ? AND item_id = ? AND quantity <= 0`,
                        [userId, hasDrink.item_id]
                    );

                    db.run('COMMIT', (err) => {
                        if (err) {
                            console.error('Transaction error:', err);
                            db.run('ROLLBACK');
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });

                resolve({
                    name: drinkData.name,
                    ...effect
                });

            } catch (error) {
                console.error('Error in drink:', error);
                reject(error);
            }
        });
    }

    static async shop() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM items WHERE price > 0', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async buy(userId, itemNumber, quantity = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!global.itemMap) {
                    throw new Error('Silakan cek toko dulu dengan !toko');
                }

                const item = global.itemMap.get(parseInt(itemNumber));
                if (!item) {
                    throw new Error('Nomor item tidak valid!');
                }

                const totalCost = item.price * quantity;
                const stats = await this.getStats(userId);

                if (stats.gold < totalCost) {
                    throw new Error(`Gold tidak cukup! Butuh ${totalCost} gold`);
                }

                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION');

                    db.run(
                        `UPDATE rpg_stats SET gold = gold - ? WHERE user_id = ?`,
                        [totalCost, userId]
                    );

                    db.run(
                        `INSERT INTO inventory (user_id, item_id, quantity) 
                        VALUES (?, ?, ?)
                        ON CONFLICT(user_id, item_id) DO UPDATE SET 
                        quantity = quantity + ?`,
                        [userId, item.id, quantity, quantity]
                    );

                    db.run('COMMIT', (err) => {
                        if (err) {
                            console.error('Transaction error:', err);
                            db.run('ROLLBACK');
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });

                resolve({
                    item: item.name,
                    quantity,
                    totalCost
                });

            } catch (error) {
                console.error('Error in buy:', error);
                reject(error);
            }
        });
    }

    static async sell(userId, itemNumber, quantity = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                // Cek apakah inventoryMap ada
                if (!global.inventoryMap) {
                    throw new Error('Silakan cek inventory dulu dengan !inv');
                }

                // Ambil item dari inventoryMap
                const itemData = global.inventoryMap.get(parseInt(itemNumber));
                if (!itemData) {
                    throw new Error('Nomor item tidak valid! Cek !inv untuk daftar item');
                }

                // Cek inventory
                const inventory = await this.getInventory(userId);
                const hasItem = inventory.find(i => i.id === itemData.id);

                if (!hasItem) {
                    throw new Error(`Kamu tidak punya ${itemData.name}!`);
                }

                if (hasItem.quantity < quantity) {
                    throw new Error(`Kamu hanya punya ${hasItem.quantity} ${itemData.name}!`);
                }

                // Hitung harga jual (70% dari harga beli)
                const sellPrice = Math.floor(itemData.price * 0.7);
                const totalEarned = sellPrice * quantity;

                // Mulai transaksi
                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION');

                    // Tambah gold
                    db.run(
                        `UPDATE rpg_stats SET gold = gold + ? WHERE user_id = ?`,
                        [totalEarned, userId]
                    );

                    // Kurangi item dari inventory
                    db.run(
                        `UPDATE inventory SET quantity = quantity - ? 
                        WHERE user_id = ? AND item_id = ?`,
                        [quantity, userId, itemData.id]
                    );

                    // Hapus item jika quantity 0
                    db.run(
                        `DELETE FROM inventory 
                        WHERE user_id = ? AND item_id = ? AND quantity <= 0`,
                        [userId, itemData.id]
                    );

                    db.run('COMMIT', (err) => {
                        if (err) {
                            console.error('Transaction error:', err);
                            db.run('ROLLBACK');
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });

                resolve({
                    item: itemData.name,
                    quantity,
                    totalEarned
                });

            } catch (error) {
                console.error('Error in sell:', error);
                reject(error);
            }
        });
    }

    static async getAllDungeons() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM dungeons ORDER BY min_level ASC`, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    static async enterDungeon(userId, dungeonName) {
        return new Promise(async (resolve, reject) => {
            try {
                // Cek dungeon exists
                const dungeon = await this.getDungeonByName(dungeonName);
                if (!dungeon) {
                    throw new Error('Dungeon tidak ditemukan!');
                }

                // Cek player stats
                const stats = await this.getStats(userId);
                if (stats.level < dungeon.min_level) {
                    throw new Error(`Level kamu terlalu rendah! Minimal level ${dungeon.min_level}`);
                }

                // Cek cooldown
                const lastDungeon = await this.getLastDungeon(userId);
                if (lastDungeon) {
                    const cooldownMinutes = dungeon.cooldown_minutes || 30;
                    const timeDiff = (Date.now() - new Date(lastDungeon.last_enter).getTime()) / 1000 / 60;
                    if (timeDiff < cooldownMinutes) {
                        throw new Error(`Tunggu ${Math.ceil(cooldownMinutes - timeDiff)} menit lagi`);
                    }
                }

                // Mulai battle
                let playerHP = stats.health;
                let dungeonHP = dungeon.hp;
                let battleLog = [];
                let win = false;

                while (playerHP > 0 && dungeonHP > 0) {
                    // Player attack
                    const playerDamage = Math.max(1, stats.strength - dungeon.defense);
                    dungeonHP -= playerDamage;
                    battleLog.push(`👊 Kamu menyerang! (-${playerDamage} HP)`);

                    if (dungeonHP <= 0) {
                        win = true;
                        break;
                    }

                    // Dungeon attack
                    const dungeonDamage = Math.max(1, dungeon.attack - stats.defense);
                    playerHP -= dungeonDamage;
                    battleLog.push(`💥 ${dungeon.name} menyerang! (-${dungeonDamage} HP)`);
                }

                // Update last dungeon entry
                await db.run(`INSERT OR REPLACE INTO dungeon_history (user_id, dungeon_id, last_enter) 
                    VALUES (?, ?, datetime('now'))`, [userId, dungeon.id]);

                // Update player HP
                await db.run(`UPDATE rpg_stats SET health = ? WHERE user_id = ?`, 
                    [Math.max(0, playerHP), userId]);

                let rewards = {
                    exp: 0,
                    gold: 0,
                    items: []
                };

                if (win) {
                    rewards.exp = dungeon.exp_reward;
                    rewards.gold = dungeon.gold_reward;

                    // Random item drops
                    if (dungeon.item_drops) {
                        const possibleItems = JSON.parse(dungeon.item_drops);
                        for (const [itemName, chance] of Object.entries(possibleItems)) {
                            if (Math.random() < chance) {
                                rewards.items.push(itemName);
                                await this.addItem(userId, itemName, 1);
                            }
                        }
                    }

                    // Add exp and gold
                    await this.addExp(userId, rewards.exp);
                    await this.addGold(userId, rewards.gold);
                }

                resolve({
                    win,
                    battleLog,
                    rewards
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getDungeonByName(dungeonName) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM dungeons WHERE name = ? COLLATE NOCASE`, [dungeonName], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async getLastDungeon(userId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM dungeon_history WHERE user_id = ?`, [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async learnSkill(userId, skillName) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const skill = await this.getSkillByName(skillName);

                if (stats.level < skill.min_level) {
                    reject(new Error(`Level kamu terlalu rendah! Minimal level ${skill.min_level}`));
                    return;
                }

                if (stats.gold < skill.price) {
                    reject(new Error(`Gold tidak cukup! Butuh ${skill.price} gold`));
                    return;
                }

                await this.addUserSkill(userId, skill.id);
                await this.updateGold(userId, -skill.price);

                resolve(skill);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async useSkill(userId, skillName, targetId = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats = await this.getStats(userId);
                const skill = await this.getSkillByName(skillName);
                const userSkill = await this.getUserSkill(userId, skill.id);

                if (!userSkill) {
                    reject(new Error('Kamu belum mempelajari skill ini!'));
                    return;
                }

                // Cek cooldown
                if (userSkill.last_used) {
                    const cooldownEnd = moment(userSkill.last_used).add(skill.cooldown_seconds, 'seconds');
                    if (moment().isBefore(cooldownEnd)) {
                        const remaining = moment.duration(cooldownEnd.diff(moment()));
                        reject(new Error(`Skill masih cooldown! Tunggu ${remaining.seconds()} detik lagi`));
                        return;
                    }
                }

                if (stats.mana < skill.mana_cost) {
                    reject(new Error(`Mana tidak cukup! Butuh ${skill.mana_cost} MP`));
                    return;
                }

                // Proses efek skill
                const effect = JSON.parse(skill.effect);
                let result = {
                    skillName: skill.name,
                    effect: {}
                };

                switch (skill.type) {
                    case 'attack':
                        if (!targetId) {
                            reject(new Error('Target tidak ditemukan!'));
                            return;
                        }
                        await this.applyDamage(targetId, effect.damage);
                        result.effect.damage = effect.damage;
                        break;

                    case 'support':
                        if (effect.health) {
                            await this.heal(userId, effect.health);
                            result.effect.heal = effect.health;
                        }
                        break;

                    case 'defense':
                        await this.addTemporaryDefense(userId, effect.defense);
                        result.effect.defense = effect.defense;
                        break;
                }

                // Update mana dan cooldown
                await this.updateMana(userId, -skill.mana_cost);
                await this.updateSkillCooldown(userId, skill.id);

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getQuests(userId) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT q.*, uq.progress, uq.completed 
                   FROM quests q 
                   LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = ?
                   WHERE q.min_level <= (SELECT level FROM rpg_stats WHERE user_id = ?)`,
            [userId, userId],
            (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async updateQuestProgress(userId, questType, amount = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                const quests = await this.getActiveQuests(userId, questType);
                let completedQuests = [];

                for (const quest of quests) {
                    const newProgress = quest.progress + amount;
                    if (newProgress >= quest.target_amount && !quest.completed) {
                        // Quest completed
                        await this.completeQuest(userId, quest.id);
                        completedQuests.push(quest);
                    } else {
                        // Update progress
                        await this.updateProgress(userId, quest.id, newProgress);
                    }
                }

                resolve(completedQuests);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getAllSkills() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM skills ORDER BY min_level ASC`, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.map(row => {
                    try {
                        row.effect = JSON.parse(row.effect);
                    } catch (e) {
                        console.error('Error parsing skill effect:', e);
                        row.effect = {};
                    }
                    return row;
                }));
            });
        });
    }

    static async getUserSkills(userId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT s.*, us.last_used 
                FROM skills s 
                JOIN user_skills us ON s.id = us.skill_id 
                WHERE us.user_id = ?
                ORDER BY s.min_level ASC
            `, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.map(row => {
                    try {
                        row.effect = JSON.parse(row.effect);
                    } catch (e) {
                        console.error('Error parsing skill effect:', e);
                        row.effect = {};
                    }
                    return row;
                }));
            });
        });
    }

    static async getSkillByName(skillName) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM skills 
                WHERE LOWER(name) = LOWER(?)
                OR LOWER(name) LIKE LOWER(?)
            `;
            db.get(query, [skillName, `%${skillName}%`], (err, row) => {
                if (err) {
                    console.error('Error in getSkillByName:', err);
                    console.error('Skill name:', skillName);
                    reject(err);
                    return;
                }
                if (!row) {
                    console.log('Skill not found:', skillName);
                    console.log('Checking all skills in database...');
                    db.all('SELECT name FROM skills', [], (err, rows) => {
                        if (err) {
                            console.error('Error checking skills:', err);
                        } else {
                            console.log('Available skills:', rows.map(r => r.name));
                        }
                    });
                }
                resolve(row);
            });
        });
    }

    static async hasSkill(userId, skillId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT 1 FROM user_skills WHERE user_id = ? AND skill_id = ?`, 
            [userId, skillId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(!!row);
            });
        });
    }

    static async addUserSkill(userId, skillId) {
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO user_skills (user_id, skill_id) VALUES (?, ?)`,
            [userId, skillId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    static async updateSkillCooldown(userId, skillId) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE user_skills SET last_used = CURRENT_TIMESTAMP 
                WHERE user_id = ? AND skill_id = ?`,
            [userId, skillId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    static async getSkillCooldown(userId, skillId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT last_used FROM user_skills 
                WHERE user_id = ? AND skill_id = ?`,
            [userId, skillId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row?.last_used);
            });
        });
    }

    static async sellItem(userId, itemName, amount = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                // Validasi input
                if (amount < 1) {
                    throw new Error('Jumlah item harus lebih dari 0!');
                }

                // Get item details dari shop
                const item = await this.getShopItem(itemName);
                if (!item) {
                    throw new Error('Item tidak ditemukan di toko!');
                }
                if (!item.is_sellable) {
                    throw new Error('Item ini tidak bisa dijual!');
                }

                // Cek inventory player
                const inventory = await this.getInventory(userId);
                const userItem = inventory.find(i => 
                    i.item_name.toLowerCase() === itemName.toLowerCase()
                );
                
                if (!userItem) {
                    throw new Error(`Kamu tidak memiliki item ${itemName}!`);
                }
                
                if (userItem.quantity < amount) {
                    throw new Error(`Kamu hanya memiliki ${userItem.quantity}x ${itemName}!`);
                }

                // Hitung total harga jual
                const totalPrice = item.sell_price * amount;

                // Mulai transaksi
                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION', (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });

                try {
                    // Update inventory (kurangi item)
                    await new Promise((resolve, reject) => {
                        db.run(
                            `UPDATE inventory 
                            SET quantity = quantity - ? 
                            WHERE user_id = ? AND item_name = ? COLLATE NOCASE`,
                            [amount, userId, itemName],
                            (err) => {
                                if (err) reject(err);
                                resolve();
                            }
                        );
                    });

                    // Hapus item dari inventory jika quantity = 0
                    await new Promise((resolve, reject) => {
                        db.run(
                            `DELETE FROM inventory 
                            WHERE user_id = ? AND item_name = ? AND quantity <= 0`,
                            [userId, itemName],
                            (err) => {
                                if (err) reject(err);
                                resolve();
                            }
                        );
                    });

                    // Update gold player
                    await new Promise((resolve, reject) => {
                        db.run(
                            `UPDATE rpg_stats 
                            SET gold = gold + ? 
                            WHERE user_id = ?`,
                            [totalPrice, userId],
                            (err) => {
                                if (err) reject(err);
                                resolve();
                            }
                        );
                    });

                    // Commit transaksi
                    await new Promise((resolve, reject) => {
                        db.run('COMMIT', (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    });

                    // Return hasil penjualan
                    resolve({
                        item: {
                            name: item.name,
                            sell_price: item.sell_price
                        },
                        amount,
                        totalPrice,
                        remainingQuantity: userItem.quantity - amount
                    });

                } catch (error) {
                    // Rollback jika terjadi error
                    await new Promise((resolve) => {
                        db.run('ROLLBACK', () => resolve());
                    });
                    throw error;
                }

            } catch (error) {
                reject(error);
            }
        });
    }

    static async getShopItem(itemName) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM shop_items WHERE name LIKE ? COLLATE NOCASE`,
                [itemName],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (row) {
                        try {
                            row.effect = JSON.parse(row.effect);
                        } catch (e) {
                            console.error('Error parsing item effect:', e);
                            row.effect = {};
                        }
                    }
                    resolve(row);
                }
            );
        });
    }

    static async updateGold(userId, amount) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE rpg_stats 
                SET gold = gold + ? 
                WHERE user_id = ?`,
                [amount, userId],
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                }
            );
        });
    }

    static async equipItem(userId, itemName) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await this.getItemByName(itemName);
                if (!item || !item.type.includes('equipment')) {
                    throw new Error('Item ini tidak bisa diequip!');
                }

                const inventory = await this.getInventory(userId);
                const hasItem = inventory.find(i => i.name === itemName);
                if (!hasItem) {
                    throw new Error('Kamu tidak memiliki item ini!');
                }

                // Unequip item lama di slot yang sama
                await db.run(`UPDATE equipment SET 
                    is_equipped = 0 
                    WHERE user_id = ? AND slot = ?`,
                [userId, item.slot]);

                // Equip item baru
                await db.run(`UPDATE inventory SET 
                    is_equipped = 1 
                    WHERE user_id = ? AND item_name = ?`,
                [userId, itemName]);

                // Update stats
                const effect = JSON.parse(item.effect);
                await this.updateStats(userId, effect);

                resolve({
                    item: item.name,
                    effect: effect
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    static async updateStatsOnLevelUp(userId, newLevel) {
        return new Promise(async (resolve, reject) => {
            try {
                // Bonus stats per level
                const bonusStats = {
                    max_health: 10,
                    max_mana: 5,
                    strength: 2,
                    defense: 2,
                    agility: 1,
                    intelligence: 1
                };

                // Update stats
                const updateQuery = `UPDATE rpg_stats SET 
                    max_health = max_health + ?,
                    max_mana = max_mana + ?,
                    strength = strength + ?,
                    defense = defense + ?,
                    agility = agility + ?,
                    intelligence = intelligence + ?,
                    health = max_health,
                    mana = max_mana
                    WHERE user_id = ?`;

                await db.run(updateQuery, [
                    bonusStats.max_health,
                    bonusStats.max_mana,
                    bonusStats.strength,
                    bonusStats.defense,
                    bonusStats.agility,
                    bonusStats.intelligence,
                    userId
                ]);

                // Berikan reward item pada level tertentu
                const levelRewards = {
                    5: { item: 'Wooden Sword', quantity: 1 },
                    10: { item: 'Iron Armor', quantity: 1 },
                    15: { item: 'Health Potion', quantity: 5 },
                    20: { item: 'Steel Sword', quantity: 1 }
                };

                if (levelRewards[newLevel]) {
                    await this.addItem(userId, levelRewards[newLevel].item, levelRewards[newLevel].quantity);
                }

                // Update title/gelar
                const newTitle = this.getTitleByLevel(newLevel);
                if (newTitle) {
                    await db.run(`UPDATE rpg_stats SET title = ? WHERE user_id = ?`, [newTitle, userId]);
                }

                resolve({
                    bonusStats,
                    rewards: levelRewards[newLevel],
                    title: newTitle
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static getTitleByLevel(level) {
        const titles = {
            1: 'Pemula',
            5: 'Petualang',
            10: 'Pejuang',
            15: 'Ksatria',
            20: 'Pahlawan',
            25: 'Legenda',
            30: 'Penguasa',
            40: 'Dewa Perang',
            50: 'Legenda Abadi'
        };

        // Cari title tertinggi yang sudah dicapai
        let highestTitle = 'Pemula';
        for (const [reqLevel, title] of Object.entries(titles)) {
            if (level >= parseInt(reqLevel)) {
                highestTitle = title;
            } else {
                break;
            }
        }
        return highestTitle;
    }

    static async createParty(userId, partyName) {
        return new Promise(async (resolve, reject) => {
            try {
                // Cek apakah user sudah dalam party
                const existingParty = await this.getUserParty(userId);
                if (existingParty) {
                    throw new Error('Kamu sudah bergabung dalam party!');
                }

                // Buat party baru
                await db.run(`INSERT INTO parties (name, leader_id) VALUES (?, ?)`,
                [partyName, userId]);

                const partyId = await this.getLastInsertId();

                // Tambahkan leader ke party
                await db.run(`INSERT INTO party_members (party_id, user_id, role) VALUES (?, ?, 'leader')`,
                [partyId, userId]);

                resolve({
                    id: partyId,
                    name: partyName,
                    leaderId: userId
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async joinParty(userId, partyId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Cek apakah party ada
                const party = await this.getParty(partyId);
                if (!party) {
                    throw new Error('Party tidak ditemukan!');
                }

                // Cek apakah party sudah penuh (max 4 member)
                const memberCount = await this.getPartyMemberCount(partyId);
                if (memberCount >= 4) {
                    throw new Error('Party sudah penuh!');
                }

                // Tambahkan member baru
                await db.run(`INSERT INTO party_members (party_id, user_id, role) VALUES (?, ?, 'member')`,
                [partyId, userId]);

                resolve(party);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async craftItem(userId, itemName) {
        return new Promise(async (resolve, reject) => {
            try {
                const recipe = await this.getRecipe(itemName);
                if (!recipe) {
                    throw new Error('Resep tidak ditemukan!');
                }

                // Cek level requirement
                const stats = await this.getStats(userId);
                if (stats.level < recipe.level_required) {
                    throw new Error(`Level tidak cukup! Butuh level ${recipe.level_required}`);
                }

                // Cek materials
                const materials = JSON.parse(recipe.materials);
                const inventory = await this.getInventory(userId);

                for (const [material, amount] of Object.entries(materials)) {
                    const hasItem = inventory.find(i => i.name === material);
                    if (!hasItem || hasItem.quantity < amount) {
                        throw new Error(`Material tidak cukup! Butuh ${material} x${amount}`);
                    }
                }

                // Kurangi materials
                for (const [material, amount] of Object.entries(materials)) {
                    await this.removeItem(userId, material, amount);
                }

                // Tambah item hasil craft
                await this.addItem(userId, itemName, 1);

                resolve({
                    item: itemName,
                    materials: materials
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async startPvP(userId1, userId2) {
        return new Promise(async (resolve, reject) => {
            try {
                const stats1 = await this.getStats(userId1);
                const stats2 = await this.getStats(userId2);

                let hp1 = stats1.health;
                let hp2 = stats2.health;
                let battleLog = [];

                // Hitung initiative berdasarkan agility
                const firstAttacker = stats1.agility > stats2.agility ? userId1 : userId2;
                let currentTurn = firstAttacker;

                while (hp1 > 0 && hp2 > 0) {
                    const attacker = currentTurn === userId1 ? stats1 : stats2;
                    const defender = currentTurn === userId1 ? stats2 : stats1;
                    
                    // Hitung damage dengan element dan status effect
                    let damage = this.calculateDamage(attacker, defender);
                    
                    if (currentTurn === userId1) {
                        hp2 -= damage;
                        battleLog.push(`⚔️ ${stats1.name} menyerang! (-${damage} HP)`);
                    } else {
                        hp1 -= damage;
                        battleLog.push(`⚔️ ${stats2.name} menyerang! (-${damage} HP)`);
                    }

                    // Ganti giliran
                    currentTurn = currentTurn === userId1 ? userId2 : userId1;
                }

                const winner = hp1 > 0 ? userId1 : userId2;
                const loser = hp1 > 0 ? userId2 : userId1;

                // Update stats dan rewards
                await this.updatePvPStats(winner, loser);

                resolve({
                    winner,
                    battleLog,
                    finalHP: {
                        [userId1]: Math.max(0, hp1),
                        [userId2]: Math.max(0, hp2)
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static calculateDamage(attacker, defender) {
        // Base damage
        let damage = attacker.strength - defender.defense;
        
        // Element bonus (contoh)
        if (attacker.element === 'fire' && defender.element === 'ice') {
            damage *= 1.5;
        }
        
        // Critical hit (berdasarkan agility)
        if (Math.random() < attacker.agility / 100) {
            damage *= 2;
        }
        
        return Math.max(1, Math.floor(damage));
    }

    static async addPet(userId, petName) {
        return new Promise(async (resolve, reject) => {
            try {
                const pet = await this.getPetByName(petName);
                if (!pet) {
                    throw new Error('Pet tidak ditemukan!');
                }

                // Cek apakah sudah punya pet aktif
                const activePet = await this.getActivePet(userId);
                if (activePet) {
                    throw new Error('Kamu sudah punya pet aktif!');
                }

                // Tambah pet ke inventory
                await db.run(`INSERT INTO user_pets (user_id, pet_id, level, exp, happiness) 
                    VALUES (?, ?, 1, 0, 100)`,
                [userId, pet.id]);

                resolve(pet);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async feedPet(userId, foodName) {
        return new Promise(async (resolve, reject) => {
            try {
                const pet = await this.getActivePet(userId);
                if (!pet) {
                    throw new Error('Kamu tidak punya pet aktif!');
                }

                const food = await this.getItemByName(foodName);
                if (!food || food.type !== 'pet_food') {
                    throw new Error('Makanan pet tidak valid!');
                }

                // Update happiness dan exp pet
                const effect = JSON.parse(food.effect);
                await db.run(`UPDATE user_pets SET 
                    happiness = MIN(happiness + ?, 100),
                    exp = exp + ?
                    WHERE user_id = ? AND is_active = 1`,
                [effect.happiness, effect.exp, userId]);

                // Cek level up pet
                await this.checkPetLevelUp(userId);

                resolve(effect);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getShopItems() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM items WHERE type != 'scrap' ORDER BY type, price ASC`, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async addItem(userId, itemName, quantity = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                // Cek apakah item ada di database
                const item = await this.getItemByName(itemName);
                if (!item) {
                    throw new Error('Item tidak ditemukan');
                }

                // Cek apakah user sudah punya item ini
                const existingItem = await this.getInventoryItem(userId, itemName);
                
                if (existingItem) {
                    // Update quantity jika item sudah ada
                    await db.run(`UPDATE inventory SET 
                        quantity = quantity + ? 
                        WHERE user_id = ? AND item_id = ?`,
                    [quantity, userId, item.id]);
                } else {
                    // Insert item baru jika belum ada
                    await db.run(`INSERT INTO inventory (user_id, item_id, quantity) 
                        VALUES (?, ?, ?)`,
                    [userId, item.id, quantity]);
                }

                resolve({
                    name: itemName,
                    quantity: quantity
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    static async getInventoryItem(userId, itemName) {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT i.*, items.name, items.type, items.effect 
                FROM inventory i 
                JOIN items ON i.item_id = items.id 
                WHERE i.user_id = ? AND items.name = ? COLLATE NOCASE
            `, [userId, itemName], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async removeItem(userId, itemName, quantity = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await this.getItemByName(itemName);
                if (!item) {
                    throw new Error('Item tidak ditemukan');
                }

                // Update quantity
                await db.run(`UPDATE inventory SET 
                    quantity = CASE
                        WHEN quantity - ? <= 0 THEN 0
                        ELSE quantity - ?
                    END
                    WHERE user_id = ? AND item_id = ?`,
                [quantity, quantity, userId, item.id]);

                // Hapus item dari inventory jika quantity 0
                await db.run(`DELETE FROM inventory 
                    WHERE user_id = ? AND item_id = ? AND quantity <= 0`,
                [userId, item.id]);

                resolve({
                    name: itemName,
                    quantity: quantity
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    static async getItemByName(itemName) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM items 
                WHERE LOWER(name) = LOWER(?)
                OR LOWER(name) LIKE LOWER(?)
            `;
            db.get(query, [itemName, `%${itemName}%`], (err, row) => {
                if (err) {
                    console.error('Error in getItemByName:', err);
                    console.error('Item name:', itemName);
                    reject(err);
                    return;
                }
                if (!row) {
                    console.log('Item not found:', itemName);
                    console.log('Checking all items in database...');
                    db.all('SELECT name FROM items', [], (err, rows) => {
                        if (err) {
                            console.error('Error checking items:', err);
                        } else {
                            console.log('Available items:', rows.map(r => r.name));
                        }
                    });
                }
                resolve(row);
            });
        });
    }

    static async addExp(userId, expAmount) {
        return new Promise(async (resolve, reject) => {
            try {
                // Inisialisasi player jika belum ada
                await this.initPlayer(userId);

                // Dapatkan stats user saat ini
                const stats = await this.getStats(userId);
                if (!stats) {
                    throw new Error('User tidak ditemukan');
                }

                // Hitung exp dan level baru
                const currentExp = stats.exp + expAmount;
                const currentLevel = stats.level;
                const expNeeded = currentLevel * 1000; // Setiap level butuh exp lebih banyak

                let newLevel = currentLevel;
                let levelUp = false;

                // Cek apakah naik level
                if (currentExp >= expNeeded) {
                    newLevel = currentLevel + 1;
                    levelUp = true;
                }

                // Update exp dan level di database
                await db.run(`UPDATE rpg_stats SET 
                    exp = ?,
                    level = ?
                    WHERE user_id = ?`,
                [currentExp, newLevel, userId]);

                // Jika naik level, update stats
                if (levelUp) {
                    await this.updateStatsOnLevelUp(userId, newLevel);
                }

                resolve({
                    levelUp,
                    newLevel,
                    currentExp,
                    expNeeded
                });

            } catch (error) {
                console.error('Error in addExp:', error);
                reject(error);
            }
        });
    }

    static async initializeDefaultItems() {
        return new Promise((resolve, reject) => {
            const defaultItems = [
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
                
                // Rongsokan
                ['Botol Plastik', 'scrap', 'common', 50, null, 'Botol plastik bekas yang bisa didaur ulang'],
                ['Kardus Bekas', 'scrap', 'common', 75, null, 'Kardus bekas yang masih bisa dijual'],
                ['Kaleng Bekas', 'scrap', 'common', 100, null, 'Kaleng bekas berbagai ukuran'],
                ['Besi Berkarat', 'scrap', 'uncommon', 150, null, 'Potongan besi bekas yang berkarat'],
                ['Kabel Bekas', 'scrap', 'uncommon', 200, null, 'Kabel-kabel bekas berbagai ukuran'],
                ['Elektronik Rusak', 'scrap', 'rare', 500, null, 'Barang elektronik rusak yang masih bisa dijual']
            ];

            // Hapus semua item yang ada
            db.run('DELETE FROM items', [], (err) => {
                if (err) {
                    console.error('Error clearing items:', err);
                    reject(err);
                    return;
                }

                // Reset auto increment
                db.run('DELETE FROM sqlite_sequence WHERE name="items"', [], (err) => {
                    if (err) {
                        console.error('Error resetting sequence:', err);
                    }
                });

                // Insert item baru
                const stmt = db.prepare('INSERT INTO items (name, type, rarity, price, effect, description) VALUES (?, ?, ?, ?, ?, ?)');
                defaultItems.forEach(item => {
                    stmt.run(item, (err) => {
                        if (err) {
                            console.error('Error inserting item:', err);
                            console.error('Item data:', item);
                        }
                    });
                });
                stmt.finalize((err) => {
                    if (err) {
                        console.error('Error finalizing statement:', err);
                        reject(err);
                    } else {
                        console.log('Default items initialized successfully');
                        resolve();
                    }
                });
            });
        });
    }
}

export default RPG; 