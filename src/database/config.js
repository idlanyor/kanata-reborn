import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, 'db.json')

// Default data structure
const defaultData = {
  users: [],
  messages: [],
  plugins: [],
  sessions: [],
  commands: [],
  rpg_stats: [],
  inventory: [],
  items: [],
  afk_status: [],
  group_settings: [],
  spam_detection: [],
  jadibot_sessions: [],
  bot_rentals: [],
  rental_plans: [
    {
      plan_name: 'Basic',
      duration_days: 30,
      price: 10000,
      features: ['antilink', 'welcome', 'antispam']
    },
    {
      plan_name: 'Premium', 
      duration_days: 30,
      price: 25000,
      features: ['antilink', 'welcome', 'antispam', 'antitoxic', 'games']
    },
    {
      plan_name: 'Permanent',
      duration_days: 999999,
      price: 100000,
      features: ['all features']
    }
  ],
  dungeons: [
    {
      name: 'Goa Goblin',
      min_level: 1,
      hp: 100,
      attack: 10,
      defense: 5,
      exp_reward: 50,
      gold_reward: 100,
      item_drops: {
        'Wooden Sword': 0.3,
        'Health Potion': 0.5
      },
      cooldown_minutes: 30
    },
    {
      name: 'Hutan Troll',
      min_level: 5,
      hp: 200,
      attack: 20,
      defense: 10,
      exp_reward: 100,
      gold_reward: 200,
      item_drops: {
        'Iron Sword': 0.2,
        'Leather Armor': 0.4
      },
      cooldown_minutes: 45
    },
    {
      name: 'Menara Penyihir',
      min_level: 10,
      hp: 400,
      attack: 35,
      defense: 20,
      exp_reward: 200,
      gold_reward: 400,
      item_drops: {
        'Magic Staff': 0.1,
        'Mana Potion': 0.6
      },
      cooldown_minutes: 60
    }
  ],
  dungeon_history: [],
  skills: [
    {
      name: 'Heal',
      type: 'support',
      effect: { health: 100 },
      mana_cost: 30,
      cooldown_seconds: 60,
      min_level: 1,
      price: 1000
    },
    {
      name: 'Fireball',
      type: 'attack',
      effect: { damage: 150 },
      mana_cost: 50,
      cooldown_seconds: 30,
      min_level: 5,
      price: 2000
    },
    {
      name: 'Shield',
      type: 'defense',
      effect: { defense: 50 },
      mana_cost: 40,
      cooldown_seconds: 90,
      min_level: 3,
      price: 1500
    },
    {
      name: 'Ultimate Attack',
      type: 'attack',
      effect: { damage: 300 },
      mana_cost: 100,
      cooldown_seconds: 180,
      min_level: 10,
      price: 5000
    }
  ],
  user_skills: [],
  quests: [
    {
      name: 'Beginner Hunter',
      description: 'Hunt 5 times',
      type: 'hunt',
      target_amount: 5,
      exp_reward: 500,
      gold_reward: 300,
      item_reward: {
        'Health Potion': 2
      },
      min_level: 1
    },
    {
      name: 'Master Scavenger',
      description: 'Mulung 10 times',
      type: 'mulung',
      target_amount: 10,
      exp_reward: 800,
      gold_reward: 500,
      item_reward: {
        'Lucky Charm': 1
      },
      min_level: 3
    },
    {
      name: 'Dungeon Explorer',
      description: 'Complete 3 dungeons',
      type: 'dungeon',
      target_amount: 3,
      exp_reward: 2000,
      gold_reward: 1000,
      item_reward: {
        'Rare Weapon': 1
      },
      min_level: 5
    }
  ],
  user_quests: [],
  parties: [],
  party_members: [],
  recipes: [],
  pets: [],
  user_pets: []
}

// Initialize database
const adapter = new JSONFile(dbPath)
const db = new Low(adapter, defaultData)

// Initialize database if empty
async function initializeDatabase() {
  await db.read()
  if (!db.data) {
    db.data = defaultData
    await db.write()
  }
}

// Initialize database on startup
initializeDatabase().catch(console.error)

// Helper functions
export const cleanSessions = async () => {
  await db.read()
  db.data.sessions = db.data.sessions.filter(session => session.session_data)
  await db.write()
}

export const saveSession = async (sessionId, sessionData) => {
  await db.read()
  const existingIndex = db.data.sessions.findIndex(s => s.session_id === sessionId)
  if (existingIndex >= 0) {
    db.data.sessions[existingIndex] = { session_id: sessionId, session_data: sessionData }
  } else {
    db.data.sessions.push({ session_id: sessionId, session_data: sessionData })
  }
  await db.write()
}

export const getSession = async (sessionId) => {
  await db.read()
  const session = db.data.sessions.find(s => s.session_id === sessionId)
  return session ? session.session_data : null
}

export default db