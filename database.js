const Database = require('better-sqlite3');
const path = require('path');

// Connect to SQLite database (creates file if it doesn't exist)
const db = new Database(path.join(__dirname, 'gamebot.db'));

// Create tables if they don't exist
function initializeTables() {
    // Create players table
    db.exec(`
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            health INTEGER DEFAULT 100,
            energy INTEGER DEFAULT 100,
            gold INTEGER DEFAULT 0,
            experience INTEGER DEFAULT 0,
            house_id INTEGER,
            faction_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create houses table
    db.exec(`
        CREATE TABLE IF NOT EXISTS houses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            owner_discord_id TEXT,
            description TEXT,
            level INTEGER DEFAULT 1,
            health INTEGER DEFAULT 100,
            defense INTEGER DEFAULT 0,
            resources INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create house_stats table
    db.exec(`
        CREATE TABLE IF NOT EXISTS house_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            house_id INTEGER UNIQUE,
            integrity INTEGER DEFAULT 100,
            heat INTEGER DEFAULT 100,
            food INTEGER DEFAULT 100,
            water INTEGER DEFAULT 100,
            noise INTEGER DEFAULT 0,
            power INTEGER DEFAULT 100,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE
        )
    `);

    // Create npcs table
    db.exec(`
        CREATE TABLE IF NOT EXISTS npcs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            faction_id INTEGER,
            house_id INTEGER,
            health INTEGER DEFAULT 100,
            attack INTEGER DEFAULT 10,
            defense INTEGER DEFAULT 5,
            level INTEGER DEFAULT 1,
            location TEXT,
            dialogue TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE SET NULL
        )
    `);

    // Create npc_stats table
    db.exec(`
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

    // Create factions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS factions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            leader_discord_id TEXT,
            member_count INTEGER DEFAULT 0,
            power_level INTEGER DEFAULT 0,
            territory TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create faction_members table
    db.exec(`
        CREATE TABLE IF NOT EXISTS faction_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            faction_id INTEGER,
            user_id TEXT NOT NULL,
            role TEXT DEFAULT 'member',
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE
        )
    `);

    // Create faction_resources table
    db.exec(`
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

    // Create radio_stations table
    db.exec(`
        CREATE TABLE IF NOT EXISTS radio_stations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id TEXT NOT NULL,
            owner_username TEXT NOT NULL,
            station_name TEXT NOT NULL,
            signal_strength INTEGER DEFAULT 50,
            listeners INTEGER DEFAULT 0,
            equipment_level INTEGER DEFAULT 1,
            last_broadcast DATETIME,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create radio_resources table
    db.exec(`
        CREATE TABLE IF NOT EXISTS radio_resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id INTEGER UNIQUE,
            power INTEGER DEFAULT 100,
            parts INTEGER DEFAULT 50,
            currency_spent INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES radio_stations(id) ON DELETE CASCADE
        )
    `);

    // Create urban_myths table
    db.exec(`
        CREATE TABLE IF NOT EXISTS urban_myths (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            phenomenon TEXT NOT NULL,
            witness_report TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            difficulty INTEGER DEFAULT 1,
            clues_found INTEGER DEFAULT 0,
            progress INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create parody_lyrics table
    db.exec(`
        CREATE TABLE IF NOT EXISTS parody_lyrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_title TEXT NOT NULL,
            topic TEXT NOT NULL,
            lyrics TEXT NOT NULL,
            style TEXT DEFAULT 'comedy',
            tone TEXT DEFAULT 'mild',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('Database tables initialized successfully');
}

// Query helper functions
const helpers = {
    // Player helpers
    getPlayerByDiscordId: (discordId) => {
        return db.prepare('SELECT * FROM players WHERE discord_id = ?').get(discordId);
    },

    createPlayer: (discordId, username) => {
        return db.prepare(
            'INSERT INTO players (discord_id, username) VALUES (?, ?)'
        ).run(discordId, username);
    },

    updatePlayer: (discordId, updates) => {
        const fields = Object.keys(updates);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);
        values.push(discordId);

        return db.prepare(`UPDATE players SET ${setClause} WHERE discord_id = ?`).run(...values);
    },

    // House helpers
    getHouseById: (id) => {
        return db.prepare('SELECT * FROM houses WHERE id = ?').get(id);
    },

    createHouse: (name, ownerId, description) => {
        return db.prepare(
            'INSERT INTO houses (name, owner_discord_id, description) VALUES (?, ?, ?)'
        ).run(name, ownerId, description);
    },

    updateHouse: (id, updates) => {
        const fields = Object.keys(updates);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);
        values.push(id);

        return db.prepare(`UPDATE houses SET ${setClause} WHERE id = ?`).run(...values);
    },

    // NPC helpers
    getNpcById: (id) => {
        return db.prepare('SELECT * FROM npcs WHERE id = ?').get(id);
    },

    createNpc: (name, type, factionId, location) => {
        return db.prepare(
            'INSERT INTO npcs (name, type, faction_id, location) VALUES (?, ?, ?, ?)'
        ).run(name, type, factionId, location);
    },

    updateNpc: (id, updates) => {
        const fields = Object.keys(updates);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);
        values.push(id);

        return db.prepare(`UPDATE npcs SET ${setClause} WHERE id = ?`).run(...values);
    },

    // Faction helpers
    getFactionById: (id) => {
        return db.prepare('SELECT * FROM factions WHERE id = ?').get(id);
    },

    createFaction: (name, description, leaderId) => {
        return db.prepare(
            'INSERT INTO factions (name, description, leader_discord_id, member_count) VALUES (?, ?, ?, ?)'
        ).run(name, description, leaderId, 1); // Start with 1 member (the leader)
    },

    updateFaction: (id, updates) => {
        const fields = Object.keys(updates);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);
        values.push(id);

        return db.prepare(`UPDATE factions SET ${setClause} WHERE id = ?`).run(...values);
    },

    // Faction member helpers
    addMemberToFaction: (factionId, userId, role = 'member') => {
        return db.prepare(
            'INSERT INTO faction_members (faction_id, user_id, role) VALUES (?, ?, ?)'
        ).run(factionId, userId, role);
    },

    removeMemberFromFaction: (userId) => {
        return db.prepare(
            'DELETE FROM faction_members WHERE user_id = ?'
        ).run(userId);
    },

    getFactionMembers: (factionId) => {
        return db.prepare('SELECT * FROM faction_members WHERE faction_id = ?').all(factionId);
    },

    getUserFaction: (userId) => {
        return db.prepare(`
            SELECT f.*, fm.role 
            FROM factions f 
            JOIN faction_members fm ON f.id = fm.faction_id 
            WHERE fm.user_id = ?
        `).get(userId);
    },

    // Faction resources helpers
    getFactionResources: (factionId) => {
        return db.prepare('SELECT * FROM faction_resources WHERE faction_id = ?').get(factionId);
    },

    updateFactionResources: (factionId, resources) => {
        const fields = Object.keys(resources);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => resources[field]);
        values.push(factionId);

        return db.prepare(`UPDATE faction_resources SET ${setClause} WHERE faction_id = ?`).run(...values);
    },

    createFactionResources: (factionId, resources = {}) => {
        return db.prepare(
            `INSERT INTO faction_resources (faction_id, food, materials, currency, energy) 
             VALUES (?, ?, ?, ?, ?)`
        ).run(
            factionId, 
            resources.food || 0, 
            resources.materials || 0, 
            resources.currency || 0, 
            resources.energy || 0
        );
    },

    // Radio station helpers
    getRadioStationByOwnerId: (ownerId) => {
        return db.prepare(`
            SELECT rs.*, rr.power, rr.parts, rr.currency_spent
            FROM radio_stations rs
            LEFT JOIN radio_resources rr ON rs.id = rr.station_id
            WHERE rs.owner_id = ?
        `).get(ownerId);
    },

    createRadioStation: (ownerId, ownerUsername, stationName, signalStrength, equipmentLevel) => {
        return db.prepare(
            `INSERT INTO radio_stations (owner_id, owner_username, station_name, signal_strength, equipment_level, listeners, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(ownerId, ownerUsername, stationName, signalStrength, equipmentLevel, 0, 1);
    },

    updateRadioStation: (stationId, updates) => {
        const fields = Object.keys(updates);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);
        values.push(stationId);

        return db.prepare(`UPDATE radio_stations SET ${setClause} WHERE id = ?`).run(...values);
    },

    createRadioResources: (stationId, resources = {}) => {
        return db.prepare(
            `INSERT INTO radio_resources (station_id, power, parts, currency_spent) 
             VALUES (?, ?, ?, ?)`
        ).run(
            stationId,
            resources.power || 100,
            resources.parts || 50,
            resources.currency_spent || 0
        );
    },

    updateRadioResources: (stationId, resources) => {
        const fields = Object.keys(resources);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => resources[field]);
        values.push(stationId);

        return db.prepare(`UPDATE radio_resources SET ${setClause} WHERE station_id = ?`).run(...values);
    },

    // Urban myth helpers
    createUrbanMyth: (location, phenomenon, witnessReport, status = 'active', difficulty = 1) => {
        return db.prepare(
            `INSERT INTO urban_myths (location, phenomenon, witness_report, status, difficulty, clues_found, progress) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(location, phenomenon, witnessReport, status, difficulty, 0, 0);
    },

    getUrbanMythById: (mythId) => {
        return db.prepare('SELECT * FROM urban_myths WHERE id = ?').get(mythId);
    },

    getActiveUrbanMyths: () => {
        return db.prepare('SELECT * FROM urban_myths WHERE status = \'active\' ORDER BY RANDOM()').all();
    },

    updateUrbanMythProgress: (mythId, progress, cluesFound) => {
        return db.prepare(
            `UPDATE urban_myths SET progress = ?, clues_found = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`
        ).run(progress, cluesFound, mythId);
    },

    markMythAsSolved: (mythId) => {
        return db.prepare(
            `UPDATE urban_myths SET status = 'solved', progress = 100, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`
        ).run(mythId);
    },

    getAllUrbanMyths: () => {
        return db.prepare('SELECT * FROM urban_myths ORDER BY created_at DESC').all();
    },

    getMythsByStatus: (status) => {
        return db.prepare('SELECT * FROM urban_myths WHERE status = ? ORDER BY created_at DESC').all(status);
    },

    // Parody lyrics helpers
    createParodyLyrics: (originalTitle, topic, lyrics, style = 'comedy', tone = 'mild') => {
        return db.prepare(
            `INSERT INTO parody_lyrics (original_title, topic, lyrics, style, tone) 
             VALUES (?, ?, ?, ?, ?)`
        ).run(originalTitle, topic, lyrics, style, tone);
    },

    getParodyById: (id) => {
        return db.prepare('SELECT * FROM parody_lyrics WHERE id = ?').get(id);
    },

    getRandomParody: () => {
        return db.prepare('SELECT * FROM parody_lyrics ORDER BY RANDOM() LIMIT 1').get();
    },

    getParodiesByTopic: (topic) => {
        return db.prepare('SELECT * FROM parody_lyrics WHERE topic LIKE ? ORDER BY created_at DESC').all(`%${topic}%`);
    },

    getAllParodies: () => {
        return db.prepare('SELECT * FROM parody_lyrics ORDER BY created_at DESC').all();
    },

    // Generic query functions
    runQuery: (sql, params = []) => {
        return db.prepare(sql).run(params);
    },

    getQuery: (sql, params = []) => {
        return db.prepare(sql).get(params);
    },

    allQuery: (sql, params = []) => {
        return db.prepare(sql).all(params);
    }
};

// Initialize tables on module load
initializeTables();

module.exports = helpers;