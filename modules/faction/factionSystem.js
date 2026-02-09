const db = require('../../database.js');

class FactionSystem {
    constructor() {
        this.factions = new Map(); // In-memory cache for active factions
    }

    // Create a new faction
    async createFaction(factionName, leaderId, leaderUsername) {
        // Check if faction name already exists
        const existingFaction = await db.getQuery(
            `SELECT * FROM factions WHERE name = ?`,
            [factionName]
        );
        
        if (existingFaction) {
            throw new Error(`A faction with the name "${factionName}" already exists.`);
        }
        
        // Create the faction in the database
        const result = db.createFaction(factionName, `Faction ${factionName}`, leaderId);
        
        // Add the leader as the first member
        db.addMemberToFaction(result.lastInsertRowid, leaderId, 'leader');
        
        // Initialize faction resources
        db.createFactionResources(result.lastInsertRowid, { food: 100, materials: 100, currency: 100, energy: 100 });
        
        return {
            id: result.lastInsertRowid,
            name: factionName,
            leaderId: leaderId,
            leaderUsername: leaderUsername,
            memberCount: 1,
            powerLevel: 0,
            territory: '',
            createdAt: new Date()
        };
    }

    // Join a faction
    async joinFaction(userId, username, factionId) {
        // Check if user is already in a faction
        const userCurrentFaction = db.getUserFaction(userId);
        
        if (userCurrentFaction) {
            throw new Error('You are already a member of a faction.');
        }
        
        // Check if faction exists
        const faction = await db.getQuery(
            `SELECT * FROM factions WHERE id = ?`,
            [factionId]
        );
        
        if (!faction) {
            throw new Error('Faction not found.');
        }
        
        // Add user as a member
        db.addMemberToFaction(factionId, userId, 'member');
        
        // Increment member count
        db.updateFaction(factionId, { member_count: faction.member_count + 1 });
        
        // Return updated faction info
        return await this.getFactionById(factionId);
    }

    // Get faction by ID
    async getFactionById(factionId) {
        const faction = await db.getQuery(
            `SELECT f.*, fr.food, fr.materials, fr.currency, fr.energy
             FROM factions f
             LEFT JOIN faction_resources fr ON f.id = fr.faction_id
             WHERE f.id = ?`,
            [factionId]
        );
        
        if (!faction) {
            return null;
        }
        
        // Get members
        const members = await db.allQuery(
            `SELECT user_id, role FROM faction_members WHERE faction_id = ?`,
            [factionId]
        );
        
        faction.members = members;
        return faction;
    }

    // Get faction by name
    async getFactionByName(factionName) {
        const faction = await db.getQuery(
            `SELECT f.*, fr.food, fr.materials, fr.currency, fr.energy
             FROM factions f
             LEFT JOIN faction_resources fr ON f.id = fr.faction_id
             WHERE f.name = ?`,
            [factionName]
        );
        
        if (!faction) {
            return null;
        }
        
        // Get members
        const members = await db.allQuery(
            `SELECT user_id, role FROM faction_members WHERE faction_id = ?`,
            [faction.id]
        );
        
        faction.members = members;
        return faction;
    }

    // Get user's faction
    async getUserFaction(userId) {
        const memberRecord = await db.getQuery(
            `SELECT fm.faction_id, f.name, fm.role
             FROM faction_members fm
             JOIN factions f ON fm.faction_id = f.id
             WHERE fm.user_id = ?`,
            [userId]
        );
        
        if (!memberRecord) {
            return null;
        }
        
        return await this.getFactionById(memberRecord.faction_id);
    }

    // Get all factions
    async getAllFactions() {
        const factions = await db.allQuery(
            `SELECT f.*, fr.food, fr.materials, fr.currency, fr.energy
             FROM factions f
             LEFT JOIN faction_resources fr ON f.id = fr.faction_id`
        );
        
        // Add members to each faction
        for (const faction of factions) {
            const members = await db.allQuery(
                `SELECT user_id, role FROM faction_members WHERE faction_id = ?`,
                [faction.id]
            );
            faction.members = members;
        }
        
        return factions;
    }

    // Add resources to a faction
    async addResourcesToFaction(factionId, resources) {
        const updates = [];
        const values = [];
        
        if (resources.food !== undefined) {
            updates.push('food = food + ?');
            values.push(resources.food);
        }
        if (resources.materials !== undefined) {
            updates.push('materials = materials + ?');
            values.push(resources.materials);
        }
        if (resources.currency !== undefined) {
            updates.push('currency = currency + ?');
            values.push(resources.currency);
        }
        if (resources.energy !== undefined) {
            updates.push('energy = energy + ?');
            values.push(resources.energy);
        }
        
        if (updates.length > 0) {
            values.push(factionId);
            const updateClause = updates.join(', ');
            
            await db.runQuery(
                `UPDATE faction_resources SET ${updateClause} WHERE faction_id = ?`,
                values
            );
        }
    }

    // Update faction territory
    async updateFactionTerritory(factionId, territory) {
        await db.runQuery(
            `UPDATE factions SET territory = ? WHERE id = ?`,
            [territory, factionId]
        );
    }
}

// Create and export a singleton instance
const factionSystem = new FactionSystem();

// Create the faction_members and faction_resources tables if they don't exist
db.runQuery(`
    CREATE TABLE IF NOT EXISTS faction_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faction_id INTEGER,
        user_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE
    )
`);

db.runQuery(`
    CREATE TABLE IF NOT EXISTS faction_resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faction_id INTEGER UNIQUE,
        food INTEGER DEFAULT 0,
        materials INTEGER DEFAULT 0,
        currency INTEGER DEFAULT 0,
        energy INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE
    )
`);

module.exports = factionSystem;