const db = require('../../database.js');

class RadioSystem {
    constructor() {
        this.radioStations = new Map(); // In-memory cache for active radio stations
        this.broadcastCooldown = 300000; // 5 minutes cooldown between broadcasts
    }

    // Create a new radio station for a player
    async createRadioStation(userId, username) {
        // Check if user already has a radio station
        const existingStation = await this.getRadioStationByUserId(userId);
        
        if (existingStation) {
            throw new Error('You already have a radio station.');
        }
        
        // Create the radio station in the database
        const result = db.createRadioStation(
            userId, 
            username, 
            `${username}'s Underground Radio`, 
            50, // Starting signal strength
            1   // Starting equipment level
        );
        
        // Initialize radio resources
        db.createRadioResources(result.lastInsertRowid, { power: 100, parts: 50, currency_spent: 0 });
        
        return {
            id: result.lastInsertRowid,
            owner_id: userId,
            owner_username: username,
            station_name: `${username}'s Underground Radio`,
            signal_strength: 50,
            listeners: 0,
            equipment_level: 1,
            last_broadcast: null,
            is_active: true
        };
    }

    // Get radio station by user ID
    async getRadioStationByUserId(userId) {
        return db.getRadioStationByOwnerId(userId);
    }

    // Get radio station by ID
    async getRadioStationById(stationId) {
        const station = await db.getQuery(
            `SELECT rs.*, rr.power, rr.parts, rr.currency_spent
             FROM radio_stations rs
             LEFT JOIN radio_resources rr ON rs.id = rr.station_id
             WHERE rs.id = ?`,
            [stationId]
        );
        
        return station;
    }

    // Perform a radio broadcast
    async broadcast(userId, message) {
        // Get the user's radio station
        const station = await this.getRadioStationByUserId(userId);
        
        if (!station) {
            throw new Error('You do not have a radio station. Use /radio create first.');
        }
        
        if (!station.is_active) {
            throw new Error('Your radio station is inactive.');
        }
        
        // Check if enough time has passed since the last broadcast
        if (station.last_broadcast) {
            const lastBroadcastTime = new Date(station.last_broadcast);
            const currentTime = new Date();
            const timeDiff = currentTime - lastBroadcastTime;
            
            if (timeDiff < this.broadcastCooldown) {
                const remainingTime = this.broadcastCooldown - timeDiff;
                const minutesLeft = Math.ceil(remainingTime / 60000);
                throw new Error(`You need to wait ${minutesLeft} minute(s) before broadcasting again.`);
            }
        }
        
        // Calculate new listener count based on signal strength and equipment level
        const baseListeners = 10;
        const signalMultiplier = station.signal_strength / 50; // At 50 signal, multiplier is 1
        const equipmentMultiplier = station.equipment_level * 0.5; // Each level adds 0.5 to multiplier
        
        // Random factor to make it interesting
        const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
        
        const newListeners = Math.floor(baseListeners * signalMultiplier * equipmentMultiplier * randomFactor);
        
        // Update station stats
        const newListenerCount = station.listeners + newListeners;
        const newPowerConsumption = 10; // Broadcasting consumes power
        
        // Update the station in the database
        db.updateRadioStation(station.id, { 
            listeners: newListenerCount, 
            last_broadcast: new Date().toISOString() 
        });
        
        // Update resources (consume power)
        db.updateRadioResources(station.id, { 
            power: station.power - newPowerConsumption 
        });
        
        // Potentially increase signal strength based on successful broadcast
        if (Math.random() > 0.7) { // 30% chance to improve signal
            const signalIncrease = Math.floor(Math.random() * 3) + 1; // 1-3 points
            db.updateRadioStation(station.id, { 
                signal_strength: Math.min(100, station.signal_strength + signalIncrease) 
            });
        }
        
        // Refresh the station data
        const updatedStation = await this.getRadioStationByUserId(userId);
        
        return {
            success: true,
            message: `Broadcast sent: "${message}"`,
            listeners: newListenerCount,
            signalStrength: updatedStation.signal_strength,
            equipmentLevel: updatedStation.equipment_level,
            powerRemaining: updatedStation.power - newPowerConsumption
        };
    }

    // Upgrade equipment level
    async upgradeEquipment(userId) {
        const station = await this.getRadioStationByUserId(userId);
        
        if (!station) {
            throw new Error('You do not have a radio station.');
        }
        
        // Cost increases with each level
        const upgradeCost = station.equipment_level * 20;
        
        if (station.parts < upgradeCost) {
            throw new Error(`Not enough parts to upgrade. Need ${upgradeCost} parts, but you have ${station.parts}.`);
        }
        
        // Deduct cost and upgrade equipment
        await db.runQuery(
            `UPDATE radio_resources 
             SET parts = parts - ? 
             WHERE station_id = ?`,
            [upgradeCost, station.id]
        );
        
        await db.runQuery(
            `UPDATE radio_stations 
             SET equipment_level = equipment_level + 1 
             WHERE id = ?`,
            [station.id]
        );
        
        // Refresh station data
        const updatedStation = await this.getRadioStationByUserId(userId);
        
        return {
            success: true,
            newLevel: updatedStation.equipment_level,
            partsRemaining: updatedStation.parts
        };
    }

    // Improve signal strength
    async improveSignal(userId) {
        const station = await this.getRadioStationByUserId(userId);
        
        if (!station) {
            throw new Error('You do not have a radio station.');
        }
        
        const improvementCost = 15; // Fixed cost for signal improvement
        
        if (station.parts < improvementCost) {
            throw new Error(`Not enough parts to improve signal. Need ${improvementCost} parts, but you have ${station.parts}.`);
        }
        
        // Deduct cost and improve signal
        await db.runQuery(
            `UPDATE radio_resources 
             SET parts = parts - ? 
             WHERE station_id = ?`,
            [improvementCost, station.id]
        );
        
        await db.runQuery(
            `UPDATE radio_stations 
             SET signal_strength = MIN(100, signal_strength + 5) 
             WHERE id = ?`,
            [station.id]
        );
        
        // Refresh station data
        const updatedStation = await this.getRadioStationByUserId(userId);
        
        return {
            success: true,
            newSignal: updatedStation.signal_strength,
            partsRemaining: updatedStation.parts
        };
    }

    // Get all radio stations
    async getAllRadioStations() {
        const stations = await db.allQuery(
            `SELECT rs.*, rr.power, rr.parts, rr.currency_spent
             FROM radio_stations rs
             LEFT JOIN radio_resources rr ON rs.id = rr.station_id
             ORDER BY rs.listeners DESC`
        );
        
        return stations;
    }
}

// Create and export a singleton instance
const radioSystem = new RadioSystem();

// Create the radio_stations and radio_resources tables if they don't exist
db.runQuery(`
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

db.runQuery(`
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

module.exports = radioSystem;