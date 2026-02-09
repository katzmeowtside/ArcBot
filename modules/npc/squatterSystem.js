const db = require('../../database.js');
const npcBehaviorSystem = require('./behaviorSystem.js'); // Import the behavior system

class NpcSquatterSystem {
    constructor() {
        this.npcStats = new Map(); // In-memory cache for active NPCs
        this.statLimits = {
            hunger: { min: 0, max: 100 },
            energy: { min: 0, max: 100 },
            paranoia: { min: 0, max: 100 },
            trust: { min: 0, max: 100 },
            aggression: { min: 0, max: 100 }
        };
        
        // Names for random generation
        this.firstNames = [
            'Alex', 'Jamie', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 
            'Jordan', 'Dakota', 'Cameron', 'Peyton', 'Skyler', 'Hayden', 'Reese', 
            'Logan', 'Remy', 'Emerson', 'Finley', 'Rowan'
        ];
        
        this.lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 
            'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 
            'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
        ];
        
        this.personalities = [
            'cautious', 'aggressive', 'friendly', 'paranoid', 'curious', 
            'hostile', 'cooperative', 'shy', 'bold', 'nervous'
        ];
    }

    // Generate a random NPC
    generateRandomNpc(houseId) {
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        const name = `${firstName} ${lastName}`;
        
        const personality = this.personalities[Math.floor(Math.random() * this.personalities.length)];
        
        // Generate random stats
        const npc = {
            name: name,
            house_id: houseId,
            type: 'squatter', // Default type
            hunger: Math.floor(Math.random() * 101), // 0-100
            energy: Math.floor(Math.random() * 101), // 0-100
            paranoia: Math.floor(Math.random() * 101), // 0-100
            trust: Math.floor(Math.random() * 101), // 0-100
            aggression: Math.floor(Math.random() * 101), // 0-100
            personality: personality,
            health: 100, // Default health
            attack: Math.floor(Math.random() * 21), // 0-20
            defense: Math.floor(Math.random() * 21), // 0-20
            level: Math.floor(Math.random() * 10) + 1, // 1-10
            location: 'living room', // Default location
            dialogue: this.generateRandomDialogue(personality)
        };
        
        return npc;
    }

    // Generate random dialogue based on personality
    generateRandomDialogue(personality) {
        const dialogues = {
            cautious: [
                "I don't trust anyone these days...",
                "Keep your distance!",
                "Something doesn't feel right here."
            ],
            aggressive: [
                "Get out of my space!",
                "I'll fight for what's mine!",
                "Don't mess with me!"
            ],
            friendly: [
                "Hey there, friend!",
                "How are you doing today?",
                "Nice to meet you!"
            ],
            paranoid: [
                "They're watching us...",
                "Can't trust anyone anymore.",
                "Are you one of them?"
            ],
            curious: [
                "What brings you here?",
                "Have you seen anything interesting?",
                "Tell me about yourself."
            ],
            hostile: [
                "This is my territory now!",
                "Leave or face the consequences!",
                "I don't welcome strangers."
            ],
            cooperative: [
                "Maybe we can help each other.",
                "Working together is better for everyone.",
                "What can I do to help?"
            ], // Note: Added comma here
            shy: [
                "Um... hi...",
                "I usually keep to myself.",
                "Not much of a talker..."
            ], // Note: Added comma here
            bold: [
                "I call this place home now!",
                "Nothing scares me!",
                "I can handle whatever comes."
            ], // Note: Added comma here
            nervous: [
                "Are we safe here?",
                "I keep hearing strange sounds...",
                "Something bad is going to happen."
            ]  // No comma after the last element
        };
        
        const personalityDialogues = dialogues[personality] || dialogues.cautious;
        return personalityDialogues[Math.floor(Math.random() * personalityDialogues.length)];
    }

    // Create a new NPC in the database
    async createNpc(npcData) {
        const result = await db.runQuery(
            `INSERT INTO npcs (name, type, faction_id, house_id, health, attack, defense, level, location, dialogue) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                npcData.name, 
                npcData.type, 
                npcData.faction_id || null, 
                npcData.house_id || null, 
                npcData.health, 
                npcData.attack, 
                npcData.defense, 
                npcData.level, 
                npcData.location, 
                npcData.dialogue
            ]
        );
        
        // Insert NPC stats
        await db.runQuery(
            `INSERT INTO npc_stats (npc_id, hunger, energy, paranoia, trust, aggression) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                result.lastInsertRowid,
                npcData.hunger,
                npcData.energy,
                npcData.paranoia,
                npcData.trust,
                npcData.aggression
            ]
        );
        
        return result;
    }

    // Get all NPCs for a specific house
    async getNpcsForHouse(houseId) {
        const npcs = await db.allQuery(
            `SELECT n.*, ns.hunger, ns.energy, ns.paranoia, ns.trust, ns.aggression
             FROM npcs n
             LEFT JOIN npc_stats ns ON n.id = ns.npc_id
             WHERE n.location LIKE ?
             OR n.description LIKE ?`,
            [`%${houseId}%`, `%house ${houseId}%`] // This is a simplified approach
        );
        
        // More accurate query to find NPCs in a specific house
        // Since we don't have a direct house_id column in npcs, we'll need to adjust
        // Let's assume location contains house information or we need to add a house_id column
        
        // Actually, let's query based on the house_id in the description field
        // Or we can add a house_id column to npcs table
        return npcs;
    }

    // Get all NPCs for a specific house (with house_id column)
    async getNpcsForHouseAccurate(houseId) {
        const npcs = await db.allQuery(
            `SELECT n.*, ns.hunger, ns.energy, ns.paranoia, ns.trust, ns.aggression
             FROM npcs n
             LEFT JOIN npc_stats ns ON n.id = ns.npc_id
             WHERE n.house_id = ?`,
            [houseId]
        );
        
        return npcs;
    }

    // Add an NPC to a house
    async addNpcToHouse(houseId) {
        const npc = this.generateRandomNpc(houseId);
        const result = await this.createNpc(npc);
        
        // Update the NPC's location to reference the house
        await db.runQuery(
            `UPDATE npcs SET location = ?, description = ? WHERE id = ?`,
            [`House ${houseId} - ${npc.location}`, `NPC in house ${houseId}`, result.lastInsertRowid]
        );
        
        return result;
    }

    // Update NPC stats
    async updateNpcStats(npcId, updates) {
        // Validate and clamp values
        for (const [key, value] of Object.entries(updates)) {
            if (this.statLimits[key]) {
                const limits = this.statLimits[key];
                updates[key] = Math.max(limits.min, Math.min(limits.max, value));
            }
        }

        // Update database
        const columns = Object.keys(updates);
        const values = Object.values(updates);
        values.push(npcId); // Add NPC ID for WHERE clause

        const setClause = columns.map(col => `${col} = ?`).join(', ');
        await db.runQuery(
            `UPDATE npc_stats SET ${setClause} WHERE npc_id = ?`,
            values
        );
    }

    // Get NPC by ID
    async getNpcById(npcId) {
        const npc = await db.getQuery(
            `SELECT n.*, ns.hunger, ns.energy, ns.paranoia, ns.trust, ns.aggression
             FROM npcs n
             LEFT JOIN npc_stats ns ON n.id = ns.npc_id
             WHERE n.id = ?`,
            [npcId]
        );
        return npc;
    }
}

// Create and export a singleton instance
const npcSquatterSystem = new NpcSquatterSystem();

// Create the npc_stats table if it doesn't exist
db.runQuery(`
    CREATE TABLE IF NOT EXISTS npc_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        npc_id INTEGER UNIQUE,
        hunger INTEGER DEFAULT 50,
        energy INTEGER DEFAULT 50,
        paranoia INTEGER DEFAULT 50,
        trust INTEGER DEFAULT 50,
        aggression INTEGER DEFAULT 50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (npc_id) REFERENCES npcs(id) ON DELETE CASCADE
    )
`);

module.exports = npcSquatterSystem;