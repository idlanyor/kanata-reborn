import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import User from '../src/database/models/User.js';

// Inisialisasi struktur database RPG
const defaultData = {
    rpg_stats: [
        {
            user_id: '',
            level: 1,
            exp: 0,
            health: 100,
            max_health: 100,
            mana: 50,
            max_mana: 50,
            attack: 10,
            defense: 5,
            speed: 10,
            gold: 0,
            temp_defense: 0,
            temp_defense_expires: null,
            last_hunt: null,
            last_heal: null,
            last_dungeon: null
        }
    ],
    inventory: [
        {
            user_id: '',
            item_id: 0,
            quantity: 0,
            equipped: false
        }
    ],
    items: [
        // Senjata
        {id: 1, name: 'Wooden Sword', type: 'weapon', rarity: 'common', price: 500, effect: {attack: 5}, description: 'Pedang kayu untuk pemula'},
        {id: 2, name: 'Iron Sword', type: 'weapon', rarity: 'uncommon', price: 1500, effect: {attack: 15}, description: 'Pedang besi standar'},
        {id: 3, name: 'Steel Sword', type: 'weapon', rarity: 'rare', price: 3000, effect: {attack: 25}, description: 'Pedang baja yang kuat'},
        {id: 4, name: 'Mythril Sword', type: 'weapon', rarity: 'epic', price: 7500, effect: {attack: 40}, description: 'Pedang mythril yang langka'},
        {id: 5, name: 'Dragon Slayer', type: 'weapon', rarity: 'legendary', price: 15000, effect: {attack: 60}, description: 'Pedang legendaris pembunuh naga'},

        // Armor
        {id: 6, name: 'Leather Armor', type: 'armor', rarity: 'common', price: 400, effect: {defense: 5}, description: 'Armor kulit untuk pemula'},
        {id: 7, name: 'Iron Armor', type: 'armor', rarity: 'uncommon', price: 1200, effect: {defense: 15}, description: 'Armor besi standar'},
        {id: 8, name: 'Steel Armor', type: 'armor', rarity: 'rare', price: 2500, effect: {defense: 25}, description: 'Armor baja yang kuat'},
        {id: 9, name: 'Mythril Armor', type: 'armor', rarity: 'epic', price: 6000, effect: {defense: 40}, description: 'Armor mythril yang langka'},
        {id: 10, name: 'Dragon Scale Armor', type: 'armor', rarity: 'legendary', price: 12000, effect: {defense: 60}, description: 'Armor dari sisik naga'},

        // Potion
        {id: 11, name: 'Health Potion', type: 'consumable', rarity: 'common', price: 100, effect: {heal: 30}, description: 'Memulihkan 30 HP'},
        {id: 12, name: 'Greater Health Potion', type: 'consumable', rarity: 'uncommon', price: 250, effect: {heal: 70}, description: 'Memulihkan 70 HP'},
        {id: 13, name: 'Mana Potion', type: 'consumable', rarity: 'common', price: 120, effect: {mana: 20}, description: 'Memulihkan 20 MP'},
        {id: 14, name: 'Greater Mana Potion', type: 'consumable', rarity: 'uncommon', price: 300, effect: {mana: 50}, description: 'Memulihkan 50 MP'},
        {id: 15, name: 'Stamina Potion', type: 'consumable', rarity: 'common', price: 150, effect: {stamina: 40}, description: 'Memulihkan 40 Stamina'},

        // Aksesori
        {id: 16, name: 'Ring of Strength', type: 'accessory', rarity: 'rare', price: 2000, effect: {attack: 10}, description: 'Cincin yang meningkatkan kekuatan'},
        {id: 17, name: 'Amulet of Protection', type: 'accessory', rarity: 'rare', price: 2000, effect: {defense: 10}, description: 'Amulet yang meningkatkan pertahanan'},
        {id: 18, name: 'Speed Boots', type: 'accessory', rarity: 'rare', price: 2000, effect: {speed: 10}, description: 'Sepatu yang meningkatkan kecepatan'},
        {id: 19, name: 'Mana Crystal', type: 'accessory', rarity: 'rare', price: 2000, effect: {max_mana: 20}, description: 'Kristal yang meningkatkan mana maksimal'},
        {id: 20, name: 'Life Pendant', type: 'accessory', rarity: 'rare', price: 2000, effect: {max_health: 30}, description: 'Liontin yang meningkatkan HP maksimal'}
    ],
    dungeon_history: [],
    user_skills: [
        {id: 1, name: 'Slash', type: 'attack', mana_cost: 10, cooldown: 5, effect: {damage: 20}, description: 'Tebasan pedang dasar'},
        {id: 2, name: 'Double Strike', type: 'attack', mana_cost: 15, cooldown: 8, effect: {damage: 30}, description: 'Dua serangan beruntun'},
        {id: 3, name: 'Shield Wall', type: 'defense', mana_cost: 20, cooldown: 10, effect: {defense: 15}, description: 'Meningkatkan pertahanan sementara'},
        {id: 4, name: 'Heal', type: 'support', mana_cost: 25, cooldown: 15, effect: {heal: 40}, description: 'Menyembuhkan HP'}
    ],
    user_quests: [
        {id: 1, name: 'Pemburu Pemula', description: 'Berburu 5 kali', requirement: 5, rewards: '{"gold":500,"exp":200}', type: 'hunt'},
        {id: 2, name: 'Kolektor Senjata', description: 'Kumpulkan 3 senjata berbeda', requirement: 3, rewards: '{"gold":1000,"exp":300}', type: 'collect'},
        {id: 3, name: 'Penakluk Dungeon', description: 'Selesaikan 2 dungeon', requirement: 2, rewards: '{"gold":2000,"exp":500}', type: 'dungeon'}
    ],
    parties: [
        {id: 1, name: 'Party Default', max_members: 4, level_required: 1}
    ],
    party_members: [],
    user_pets: [
        {id: 1, name: 'Wolf Pup', type: 'combat', effect: {attack: 5}, price: 1000},
        {id: 2, name: 'Baby Dragon', type: 'combat', effect: {attack: 10, defense: 5}, price: 2500},
        {id: 3, name: 'Healing Fairy', type: 'support', effect: {heal: 10}, price: 1500}
    ]
};

// Buat direktori database jika belum ada
const dbDir = path.join(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Inisialisasi lowdb
const adapter = new JSONFile(path.join(dbDir, 'rpg.json'));
const db = new Low(adapter, defaultData);

class RPG {
    static async initPlayer(userId) {
        await db.read();
        
        let player = db.data.rpg_stats.find(p => p.user_id === userId);
        if (!player) {
                    // Inisialisasi player baru
                    const defaultStats = {
                user_id: userId,
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
                gold: 1000,
                last_hunt: null,
                last_heal: null
            };

            db.data.rpg_stats.push(defaultStats);
            await db.write();
            return defaultStats;
        }
        return player;
    }

    static async getStats(userId) {
        await db.read();
        const stats = db.data.rpg_stats.find(p => p.user_id === userId);
        if (!stats) throw new Error('Player tidak ditemukan!');
        return stats;
    }

    static async hunt(userId) {
            try {
            await db.read();
                const stats = await this.getStats(userId);
                const now = new Date();
                const lastHunt = stats.last_hunt ? new Date(stats.last_hunt) : new Date(0);
                
                // Cooldown 5 menit
                if (now - lastHunt < 300000) {
                throw new Error(`Tunggu ${Math.ceil((300000 - (now - lastHunt)) / 1000)} detik lagi`);
                }

                // Generate random rewards
                const goldEarned = Math.floor(Math.random() * 100) + 50;
                const expEarned = Math.floor(Math.random() * 50) + 25;
                const healthLost = Math.floor(Math.random() * 20) + 5;

                // Update stats
            const playerIndex = db.data.rpg_stats.findIndex(p => p.user_id === userId);
            if (playerIndex !== -1) {
                db.data.rpg_stats[playerIndex].gold += goldEarned;
                db.data.rpg_stats[playerIndex].health = Math.max(1, stats.health - healthLost);
                db.data.rpg_stats[playerIndex].last_hunt = now.toISOString();
            }

            await db.write();
                    
                    // Add exp
                    const expResult = await User.addExp(userId, expEarned);
                    
            return {
                        goldEarned,
                        expEarned,
                        healthLost,
                        levelUp: expResult.levelUp,
                        newLevel: expResult.newLevel
            };
            } catch (error) {
            throw error;
            }
    }

    static async heal(userId) {
            try {
            await db.read();
                const stats = await this.getStats(userId);
                const now = new Date();
                const lastHeal = stats.last_heal ? new Date(stats.last_heal) : new Date(0);
                
                // Cooldown 3 menit
                if (now - lastHeal < 180000) {
                throw new Error(`Tunggu ${Math.ceil((180000 - (now - lastHeal)) / 1000)} detik lagi`);
                }

                const healAmount = 30;
                
            // Update stats
            const playerIndex = db.data.rpg_stats.findIndex(p => p.user_id === userId);
            if (playerIndex !== -1) {
                db.data.rpg_stats[playerIndex].health = Math.min(
                    stats.max_health,
                    stats.health + healAmount
                );
                db.data.rpg_stats[playerIndex].last_heal = now.toISOString();
            }

            await db.write();
            return healAmount;
            } catch (error) {
            throw error;
            }
    }

    static async getInventory(userId) {
        await db.read();
        const inventory = [];
        
        // Ambil semua item di inventory user
        const userItems = db.data.inventory.filter(i => i.user_id === userId);
        
        for (const userItem of userItems) {
            // Ambil detail item dari database items
            const itemDetails = db.data.items.find(item => item.id === userItem.item_id);
            if (itemDetails && userItem.quantity > 0) {
                inventory.push({
                    ...itemDetails,
                    quantity: userItem.quantity,
                    equipped: userItem.equipped || false
                });
            }
        }
        
        return inventory;
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

                db.data.rpg_stats.forEach(p => {
                    if (p.user_id === userId) {
                        p.health = Math.min(p.max_health, p.health + (effect.health || 0));
                        p.mana = Math.min(p.max_mana, p.mana + (effect.mana || 0));
                    }
                });

                await db.write();
                resolve(effect);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async scavenge(userId) {
            try {
            await db.read();

                // Cek stats player
                const stats = await this.getStats(userId);
                if (stats.energy < 10) {
                    throw new Error('Energi tidak cukup! Minimal butuh 10 energi');
                }

            // Cek cooldown
            const now = new Date();
            const lastScavenge = stats.last_scavenge ? new Date(stats.last_scavenge) : new Date(0);
            if (now - lastScavenge < 300000) { // 5 menit cooldown
                const remaining = Math.ceil((300000 - (now - lastScavenge)) / 1000);
                throw new Error(`Tunggu ${remaining} detik lagi`);
                }

                // Definisi item rongsokan yang bisa ditemukan
                const scrapItems = [
                { id: 30, name: 'Botol Plastik', type: 'scrap', value: 50, weight: 30 },
                { id: 31, name: 'Kardus Bekas', type: 'scrap', value: 75, weight: 25 },
                { id: 32, name: 'Kaleng Bekas', type: 'scrap', value: 100, weight: 20 },
                { id: 33, name: 'Besi Berkarat', type: 'scrap', value: 150, weight: 15 },
                { id: 34, name: 'Kabel Bekas', type: 'scrap', value: 200, weight: 10 }
                ];

            // Tentukan berapa item yang ditemukan (1-3 item)
            const itemCount = Math.floor(Math.random() * 3) + 1;
                let items = [];
                let totalValue = 0;

            // Pilih item dan masukkan ke inventory
                for (let i = 0; i < itemCount; i++) {
                    const roll = Math.random() * 100;
                    let cumWeight = 0;
                    
                    for (const item of scrapItems) {
                        cumWeight += item.weight;
                        if (roll <= cumWeight) {
                            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
                            
                        // Tambahkan item ke inventory
                        const existingItem = db.data.inventory.find(inv => 
                            inv.user_id === userId && inv.item_id === item.id
                        );

                        if (existingItem) {
                            existingItem.quantity += quantity;
                        } else {
                            db.data.inventory.push({
                                user_id: userId,
                                item_id: item.id,
                                quantity: quantity
                            });
                        }

                        // Pastikan item ada di database items
                        if (!db.data.items.some(i => i.id === item.id)) {
                            db.data.items.push({
                                id: item.id,
                                name: item.name,
                                type: 'scrap',
                                price: item.value,
                                description: 'Barang bekas hasil mulung'
                            });
                        }

                                items.push({
                                    name: item.name,
                            quantity: quantity,
                            value: item.value * quantity
                                });
                        
                                totalValue += item.value * quantity;
                            break;
                        }
                    }
                }

            // Update stats player
            const playerIndex = db.data.rpg_stats.findIndex(p => p.user_id === userId);
            if (playerIndex !== -1) {
                const player = db.data.rpg_stats[playerIndex];
                player.energy = Math.max(0, player.energy - 10);
                player.gold += totalValue;
                player.last_scavenge = now.toISOString();
                }

                // Tambah exp (50-100 exp random)
                const expGained = Math.floor(Math.random() * 51) + 50;
                const expResult = await this.addExp(userId, expGained);

            await db.write();

            return {
                    items,
                    totalValue,
                energyLost: 10,
                expGained,
                    levelUp: expResult.levelUp,
                    newLevel: expResult.newLevel
            };

            } catch (error) {
                console.error('Error in scavenge:', error);
            throw error;
            }
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
                    db.data.rpg_stats.forEach(p => {
                        if (p.user_id === userId) {
                            p.jail_time = jailTime.toISOString();
                        }
                    });
                    reject(new Error('Kamu tertangkap dan dipenjara selama 5 menit!'));
                    return;
                }

                const stolenAmount = Math.floor(targetStats.gold * 0.1); // Steal 10% of target's gold
                
                db.data.rpg_stats.forEach(p => {
                    if (p.user_id === userId) {
                        p.gold += stolenAmount;
                    }
                });

                db.data.rpg_stats.forEach(p => {
                    if (p.user_id === targetId) {
                        p.gold -= stolenAmount;
                    }
                });

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
                    db.data.rpg_stats.forEach(p => {
                        if (p.user_id === userId) {
                            p.hunger = Math.min(100, p.hunger + (effect.hunger || 0));
                            p.energy = Math.min(100, p.energy + (effect.energy || 0));
                            p.health = Math.min(p.max_health, p.health + (effect.health || 0));
                        }
                    });

                    // Kurangi item dari inventory
                    db.data.inventory.forEach(i => {
                        if (i.user_id === userId && i.item_id === foodData.id) {
                            i.quantity -= 1;
                        }
                    });

                    // Hapus item jika quantity 0
                    db.data.inventory = db.data.inventory.filter(i => i.quantity > 0 || i.item_id !== foodData.id);

                            resolve();
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
                    db.data.rpg_stats.forEach(p => {
                        if (p.user_id === userId) {
                            p.thirst = Math.min(100, p.thirst + (effect.thirst || 0));
                            p.energy = Math.min(100, p.energy + (effect.energy || 0));
                            p.mana = Math.min(p.max_mana, p.mana + (effect.mana || 0));
                        }
                    });

                    // Kurangi item dari inventory
                    db.data.inventory.forEach(i => {
                        if (i.user_id === userId && i.item_id === hasDrink.item_id) {
                            i.quantity -= 1;
                        }
                    });

                    // Hapus item jika quantity 0
                    db.data.inventory = db.data.inventory.filter(i => i.quantity > 0 || i.item_id !== hasDrink.item_id);

                            resolve();
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
            db.data.items.forEach(item => {
                if (item.price > 0) {
                    resolve(item);
                }
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
                    db.data.rpg_stats.forEach(p => {
                        if (p.user_id === userId) {
                            p.gold -= totalCost;
                        }
                    });

                    db.data.inventory.push({
                        user_id: userId,
                        item_id: item.id,
                        quantity: quantity
                    });

                            resolve();
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
                    db.data.rpg_stats.forEach(p => {
                        if (p.user_id === userId) {
                            p.gold += totalEarned;
                        }
                    });

                    // Kurangi item dari inventory
                    db.data.inventory = db.data.inventory.filter(i => i.user_id === userId && i.item_id !== itemData.id);

                            resolve();
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
            db.data.items.forEach(item => {
                if (item.type === 'dungeon') {
                    resolve(item);
                }
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
                await db.data.dungeon_history.push({
                    user_id: userId,
                    dungeon_id: dungeon.id,
                    last_enter: new Date().toISOString()
                });

                // Update player HP
                await db.data.rpg_stats.forEach(p => {
                    if (p.user_id === userId) {
                        p.health = Math.max(0, playerHP);
                    }
                });

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
            db.data.items.forEach(item => {
                if (item.name === dungeonName && item.type === 'dungeon') {
                    resolve(item);
                }
            });
        });
    }

    static async getLastDungeon(userId) {
        return new Promise((resolve, reject) => {
            db.data.dungeon_history.forEach(entry => {
                if (entry.user_id === userId) {
                    resolve(entry);
                }
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
            db.data.user_quests.forEach(quest => {
                if (quest.user_id === userId) {
                    resolve(quest);
                }
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
            db.data.items.forEach(item => {
                if (item.type === 'skill') {
                    resolve(item);
                }
            });
        });
    }

    static async getUserSkills(userId) {
        return new Promise((resolve, reject) => {
            db.data.user_skills.forEach(skill => {
                if (skill.user_id === userId) {
                    resolve(skill);
                }
            });
        });
    }

    static async getSkillByName(skillName) {
        return new Promise((resolve, reject) => {
            db.data.items.forEach(item => {
                if (item.name === skillName && item.type === 'skill') {
                    resolve(item);
                }
            });
        });
    }

    static async hasSkill(userId, skillId) {
        return new Promise((resolve, reject) => {
            db.data.user_skills.forEach(skill => {
                if (skill.user_id === userId && skill.skill_id === skillId) {
                    resolve(true);
                }
            });
            resolve(false);
        });
    }

    static async addUserSkill(userId, skillId) {
        return new Promise((resolve, reject) => {
            db.data.user_skills.push({
                user_id: userId,
                skill_id: skillId,
                last_used: null
            });
                resolve();
        });
    }

    static async updateSkillCooldown(userId, skillId) {
        return new Promise((resolve, reject) => {
            db.data.user_skills.forEach(skill => {
                if (skill.user_id === userId && skill.skill_id === skillId) {
                    skill.last_used = new Date().toISOString();
                }
            });
                resolve();
        });
    }

    static async getSkillCooldown(userId, skillId) {
        return new Promise((resolve, reject) => {
            db.data.user_skills.forEach(skill => {
                if (skill.user_id === userId && skill.skill_id === skillId) {
                    resolve(skill.last_used);
                }
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
                    db.data.rpg_stats.forEach(p => {
                        if (p.user_id === userId) {
                            p.gold += totalPrice;
                        }
                    });

                    db.data.inventory = db.data.inventory.filter(i => i.user_id === userId && i.item_id !== item.id);

                                resolve();
                });

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
                reject(error);
            }
        });
    }

    static async getShopItem(itemName) {
        return new Promise((resolve, reject) => {
            db.data.items.forEach(item => {
                if (item.name === itemName && item.type === 'shop') {
                    resolve(item);
                }
            });
        });
    }

    static async updateGold(userId, amount) {
        return new Promise((resolve, reject) => {
            db.data.rpg_stats.forEach(p => {
                if (p.user_id === userId) {
                    p.gold += amount;
                }
            });
                    resolve();
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
                db.data.rpg_stats.forEach(p => {
                    if (p.user_id === userId && p.slot === item.slot) {
                        p.is_equipped = 0;
                    }
                });

                // Equip item baru
                db.data.rpg_stats.forEach(p => {
                    if (p.user_id === userId && p.name === itemName) {
                        p.is_equipped = 1;
                    }
                });

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
                db.data.rpg_stats.forEach(p => {
                    if (p.user_id === userId) {
                        p.max_health += bonusStats.max_health;
                        p.max_mana += bonusStats.max_mana;
                        p.strength += bonusStats.strength;
                        p.defense += bonusStats.defense;
                        p.agility += bonusStats.agility;
                        p.intelligence += bonusStats.intelligence;
                        p.health = p.max_health;
                        p.mana = p.max_mana;
                    }
                });

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
                    db.data.rpg_stats.forEach(p => {
                        if (p.user_id === userId) {
                            p.title = newTitle;
                        }
                    });
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
                await db.data.parties.push({
                    name: partyName,
                    leader_id: userId
                });

                const partyId = db.data.parties.length;

                // Tambahkan leader ke party
                await db.data.party_members.push({
                    party_id: partyId,
                    user_id: userId,
                    role: 'leader'
                });

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
                await db.data.party_members.push({
                    party_id: partyId,
                    user_id: userId,
                    role: 'member'
                });

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
                await db.data.user_pets.push({
                    user_id: userId,
                    pet_id: pet.id,
                    level: 1,
                    exp: 0,
                    happiness: 100,
                    is_active: 1
                });

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
                await db.data.user_pets.forEach(p => {
                    if (p.user_id === userId && p.is_active === 1) {
                        p.happiness = Math.min(100, p.happiness + effect.happiness);
                        p.exp += effect.exp;
                    }
                });

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
            db.data.items.forEach(item => {
                if (item.type !== 'scrap') {
                    resolve(item);
                }
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
                    await db.data.inventory.forEach(i => {
                        if (i.user_id === userId && i.item_id === item.id) {
                            i.quantity += quantity;
                        }
                    });
                } else {
                    // Insert item baru jika belum ada
                    await db.data.inventory.push({
                        user_id: userId,
                        item_id: item.id,
                        quantity: quantity
                    });
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
            db.data.inventory.forEach(i => {
                if (i.user_id === userId && i.item_name === itemName) {
                    resolve(i);
                }
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
                await db.data.inventory.forEach(i => {
                    if (i.user_id === userId && i.item_id === item.id) {
                        i.quantity -= quantity;
                    }
                });

                // Hapus item dari inventory jika quantity 0
                db.data.inventory = db.data.inventory.filter(i => i.quantity > 0 || i.item_id !== item.id);

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
            db.data.items.forEach(item => {
                if (item.name === itemName) {
                    resolve(item);
                }
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
                await db.data.rpg_stats.forEach(p => {
                    if (p.user_id === userId) {
                        p.exp = currentExp;
                        p.level = newLevel;
                    }
                });

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
            db.data.items = [];

                // Insert item baru
            const stmt = db.data.items.push.bind(db.data.items);
                defaultItems.forEach(item => {
                stmt(item);
            });

                        resolve();
        });
    }

    static async getParty(partyId) {
        await db.read();
        return db.data.parties.find(p => p.id === partyId);
    }

    static async getUserParty(userId) {
        await db.read();
        const member = db.data.party_members.find(m => m.user_id === userId);
        if (!member) return null;
        return this.getParty(member.party_id);
    }

    static async getPartyMemberCount(partyId) {
        await db.read();
        return db.data.party_members.filter(m => m.party_id === partyId).length;
    }

    static async getRecipe(itemName) {
        await db.read();
        return db.data.items.find(i => 
            i.name === itemName && 
            i.type === 'recipe'
        );
    }

    static async updatePvPStats(winnerId, loserId) {
        await db.read();
        
        // Update winner stats
        const winnerIndex = db.data.rpg_stats.findIndex(p => p.user_id === winnerId);
        if (winnerIndex !== -1) {
            db.data.rpg_stats[winnerIndex].pvp_wins = (db.data.rpg_stats[winnerIndex].pvp_wins || 0) + 1;
            db.data.rpg_stats[winnerIndex].gold += 500; // Bonus gold untuk menang
        }

        // Update loser stats
        const loserIndex = db.data.rpg_stats.findIndex(p => p.user_id === loserId);
        if (loserIndex !== -1) {
            db.data.rpg_stats[loserIndex].pvp_losses = (db.data.rpg_stats[loserIndex].pvp_losses || 0) + 1;
        }

        await db.write();
    }

    static async getPetByName(petName) {
        await db.read();
        return db.data.items.find(i => 
            i.name === petName && 
            i.type === 'pet'
        );
    }

    static async getActivePet(userId) {
        await db.read();
        return db.data.user_pets.find(p => 
            p.user_id === userId && 
            p.is_active === 1
        );
    }

    static async checkPetLevelUp(userId) {
        await db.read();
        const petIndex = db.data.user_pets.findIndex(p => 
            p.user_id === userId && 
            p.is_active === 1
        );

        if (petIndex === -1) return;

        const pet = db.data.user_pets[petIndex];
        const expNeeded = pet.level * 500;

        if (pet.exp >= expNeeded) {
            // Level up pet
            db.data.user_pets[petIndex].level += 1;
            db.data.user_pets[petIndex].exp -= expNeeded;

            // Bonus stats untuk pet
            const bonusStats = {
                attack: 5,
                defense: 3,
                speed: 2
            };

            Object.entries(bonusStats).forEach(([stat, value]) => {
                db.data.user_pets[petIndex][stat] = 
                    (db.data.user_pets[petIndex][stat] || 0) + value;
            });

            await db.write();
            return {
                newLevel: pet.level + 1,
                bonusStats
            };
        }

        return null;
    }

    static async getActiveQuests(userId, questType) {
        await db.read();
        return db.data.user_quests.filter(q => 
            q.user_id === userId && 
            q.type === questType &&
            !q.completed
        );
    }

    static async completeQuest(userId, questId) {
        await db.read();
        const questIndex = db.data.user_quests.findIndex(q => 
            q.user_id === userId && 
            q.id === questId
        );

        if (questIndex !== -1) {
            const quest = db.data.user_quests[questIndex];
            db.data.user_quests[questIndex].completed = true;

            // Berikan reward
            const rewards = JSON.parse(quest.rewards);
            if (rewards.gold) {
                await this.updateGold(userId, rewards.gold);
            }
            if (rewards.exp) {
                await this.addExp(userId, rewards.exp);
            }
            if (rewards.items) {
                for (const [itemName, quantity] of Object.entries(rewards.items)) {
                    await this.addItem(userId, itemName, quantity);
                }
            }

            await db.write();
            return rewards;
        }

        return null;
    }

    static async updateProgress(userId, questId, newProgress) {
        await db.read();
        const questIndex = db.data.user_quests.findIndex(q => 
            q.user_id === userId && 
            q.id === questId
        );

        if (questIndex !== -1) {
            db.data.user_quests[questIndex].progress = newProgress;
            await db.write();
        }
    }

    static async updateStats(userId, effect) {
        await db.read();
        const playerIndex = db.data.rpg_stats.findIndex(p => p.user_id === userId);
        
        if (playerIndex !== -1) {
            Object.entries(effect).forEach(([stat, value]) => {
                if (db.data.rpg_stats[playerIndex][stat] !== undefined) {
                    db.data.rpg_stats[playerIndex][stat] += value;
                }
            });
            
            await db.write();
        }
    }

    static async addTemporaryDefense(userId, amount) {
        await db.read();
        const playerIndex = db.data.rpg_stats.findIndex(p => p.user_id === userId);
        
        if (playerIndex !== -1) {
            db.data.rpg_stats[playerIndex].temp_defense = 
                (db.data.rpg_stats[playerIndex].temp_defense || 0) + amount;
            db.data.rpg_stats[playerIndex].temp_defense_expires = 
                new Date(Date.now() + 300000).toISOString(); // 5 menit
            
            await db.write();
        }
    }

    static async updateMana(userId, amount) {
        await db.read();
        const playerIndex = db.data.rpg_stats.findIndex(p => p.user_id === userId);
        
        if (playerIndex !== -1) {
            const player = db.data.rpg_stats[playerIndex];
            player.mana = Math.max(0, Math.min(player.max_mana, player.mana + amount));
            await db.write();
        }
    }
}

export default RPG; 