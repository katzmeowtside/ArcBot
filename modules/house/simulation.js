const db = require('../../database.js');
const scheduler = require('../../scheduler.js');
const houseStatusPanel = require('../../graphics/houseStatusPanel.js');
const path = require('path');

class HouseSimulation {
    constructor() {
        this.houseStats = new Map(); // In-memory cache for active houses
        this.statLimits = {
            integrity: { min: 0, max: 100 },
            heat: { min: 0, max: 100 },
            food: { min: 0, max: 100 },
            water: { min: 0, max: 100 },
            noise: { min: 0, max: 100 },
            power: { min: 0, max: 100 }
        };
        
        // Register tick event listener
        scheduler.subscribe(this.handleTick.bind(this));
    }

    // Initialize house stats for a user
    async initializeHouse(userId, username) {
        // Check if house already exists in DB
        const existingHouse = await this.getHouseByUserId(userId);
        
        if (existingHouse) {
            // Load existing house into cache
            this.houseStats.set(userId, {
                id: existingHouse.id,
                userId: userId,
                username: username,
                integrity: existingHouse.integrity || 100,
                heat: existingHouse.heat || 100,
                food: existingHouse.food || 100,
                water: existingHouse.water || 100,
                noise: existingHouse.noise || 0,
                power: existingHouse.power || 100,
                lastUpdated: new Date(existingHouse.updated_at)
            });
            return existingHouse;
        } else {
            // Create new house in DB
            const newHouse = await this.createHouse(userId, username);
            this.houseStats.set(userId, {
                id: newHouse.lastInsertRowid,
                userId: userId,
                username: username,
                integrity: 100,
                heat: 100,
                food: 100,
                water: 100,
                noise: 0,
                power: 100,
                lastUpdated: new Date()
            });
            return newHouse;
        }
    }

    // Create a new house in the database
    async createHouse(userId, username) {
        const result = await db.runQuery(
            `INSERT INTO houses (name, owner_discord_id, description, level, health, defense, resources) 
             VALUES (?, ?, ?, 1, 100, 0, 0)`,
            [`House of ${username}`, userId, `House owned by ${username}`]
        );
        
        // Also insert house stats
        await db.runQuery(
            `INSERT INTO house_stats (house_id, integrity, heat, food, water, noise, power) 
             VALUES (?, 100, 100, 100, 100, 0, 100)`,
            [result.lastInsertRowid]
        );
        
        return result;
    }

    // Get house by user ID
    async getHouseByUserId(userId) {
        const house = await db.getQuery(
            `SELECT h.*, hs.integrity, hs.heat, hs.food, hs.water, hs.noise, hs.power 
             FROM houses h 
             LEFT JOIN house_stats hs ON h.id = hs.house_id 
             WHERE h.owner_discord_id = ?`,
            [userId]
        );
        return house;
    }

    // Get cached house stats
    getHouseFromCache(userId) {
        return this.houseStats.get(userId);
    }

    // Update house stats in cache and DB
    async updateHouseStats(userId, updates) {
        const house = this.houseStats.get(userId);
        if (!house) {
            throw new Error(`House not found for user ${userId}`);
        }

        // Validate and clamp values
        for (const [key, value] of Object.entries(updates)) {
            if (this.statLimits[key]) {
                const limits = this.statLimits[key];
                updates[key] = Math.max(limits.min, Math.min(limits.max, value));
            }
        }

        // Update cache
        Object.assign(house, updates);
        house.lastUpdated = new Date();

        // Update database
        const columns = Object.keys(updates);
        const values = Object.values(updates);
        values.push(house.id); // Add house ID for WHERE clause

        const setClause = columns.map(col => `${col} = ?`).join(', ');
        await db.runQuery(
            `UPDATE house_stats SET ${setClause} WHERE house_id = ?`,
            values
        );

        return house;
    }

    // Handle the global tick event
    async handleTick() {
        // Process all cached houses
        for (const [userId, house] of this.houseStats) {
            try {
                // Degrade stats over time
                const updates = {};
                
                // Integrity degrades if power is low
                if (house.power < 20 && house.integrity > 0) {
                    updates.integrity = Math.max(0, house.integrity - 2);
                }
                
                // Heat decreases over time, faster without power
                const heatLoss = house.power > 0 ? 1 : 3;
                updates.heat = Math.max(0, house.heat - heatLoss);
                
                // Food and water decrease over time
                updates.food = Math.max(0, house.food - 2);
                updates.water = Math.max(0, house.water - 2);
                
                // Noise decreases over time
                updates.noise = Math.max(0, house.noise - 1);
                
                // Power decreases if not managed
                updates.power = Math.max(0, house.power - 1);
                
                // Apply updates if any changes occurred
                if (Object.keys(updates).length > 0) {
                    await this.updateHouseStats(userId, updates);
                }
            } catch (error) {
                console.error(`Error processing tick for house ${house.id}:`, error);
            }
        }
    }

    // Repair house function
    async repairHouse(userId, repairAmount = 10) {
        const house = this.houseStats.get(userId);
        if (!house) {
            throw new Error(`House not found for user ${userId}`);
        }

        // Check if player has enough resources (for a more advanced system)
        // For now, just increase integrity
        const newIntegrity = Math.min(100, house.integrity + repairAmount);
        
        await this.updateHouseStats(userId, { integrity: newIntegrity });
        
        return {
            success: true,
            message: `House repaired! Integrity increased by ${repairAmount}.`,
            newStats: this.houseStats.get(userId)
        };
    }

    // Generate house status image
    async generateStatusImage(userId) {
        const house = this.houseStats.get(userId);
        if (!house) {
            throw new Error(`House not found for user ${userId}`);
        }

        // Prepare data for the status panel
        const panelData = {
            name: `House of ${house.username}`,
            owner: house.username,
            integrity: house.integrity,
            heat: house.heat,
            food: house.food,
            noise: house.noise,
            power: house.power
        };

        // Generate the image
        const filename = `house-status-${userId}-${Date.now()}.png`;
        const imagePath = await houseStatusPanel.render(panelData, filename);
        
        return imagePath;
    }
}

// Create and export a singleton instance
const houseSimulation = new HouseSimulation();

module.exports = houseSimulation;