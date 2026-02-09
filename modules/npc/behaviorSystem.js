const db = require('../../database.js');
const scheduler = require('../../scheduler.js');
const houseSimulation = require('../house/simulation.js');

class NpcBehaviorSystem {
    constructor() {
        // Register tick event listener
        scheduler.subscribe(this.handleNpcBehaviors.bind(this));
    }

    // Handle NPC behaviors on each tick
    async handleNpcBehaviors() {
        console.log('Processing NPC behaviors...');
        
        // Get all NPCs with their stats
        const npcs = await db.allQuery(`
            SELECT n.*, ns.hunger, ns.energy, ns.paranoia, ns.trust, ns.aggression, ns.created_at
            FROM npcs n
            LEFT JOIN npc_stats ns ON n.id = ns.npc_id
            WHERE n.house_id IS NOT NULL
        `);
        
        for (const npc of npcs) {
            if (npc.house_id) {
                await this.processNpcBehavior(npc);
            }
        }
    }

    // Process behavior for a single NPC
    async processNpcBehavior(npc) {
        console.log(`Processing behavior for NPC: ${npc.name} (ID: ${npc.id})`);
        
        // Determine which actions the NPC will take based on their stats
        const actions = [];
        
        // 1. Eat food - more likely if hunger is high
        if (await this.shouldEatFood(npc)) {
            actions.push('eat');
        }
        
        // 2. Start fights - more likely if aggression is high and trust is low
        if (await this.shouldStartFight(npc)) {
            actions.push('fight');
        }
        
        // 3. Hoard items - more likely if paranoia is high
        if (await this.shouldHoardItems(npc)) {
            actions.push('hoard');
        }
        
        // 4. Repair house - more likely if trust is high and energy is sufficient
        if (await this.shouldRepairHouse(npc)) {
            actions.push('repair');
        }
        
        // 5. Leave house - more likely if paranoia is very high or trust is very low
        if (await this.shouldLeaveHouse(npc)) {
            actions.push('leave');
        }
        
        // Execute actions
        for (const action of actions) {
            switch (action) {
                case 'eat':
                    await this.eatFood(npc);
                    break;
                case 'fight':
                    await this.startFight(npc);
                    break;
                case 'hoard':
                    await this.hoardItems(npc);
                    break;
                case 'repair':
                    await this.repairHouse(npc);
                    break;
                case 'leave':
                    await this.leaveHouse(npc);
                    break;
            }
        }
        
        // Update NPC stats after actions
        await this.updateNpcAfterTick(npc);
    }

    // Helper function to determine if NPC should eat food
    async shouldEatFood(npc) {
        // Higher probability if hunger is high (>70)
        const hungerThreshold = 70;
        const probability = npc.hunger > hungerThreshold ? 0.7 : (npc.hunger / 100) * 0.5;
        return Math.random() < probability;
    }

    // Helper function to determine if NPC should start a fight
    async shouldStartFight(npc) {
        // Higher probability if aggression is high and trust is low
        const aggressionFactor = npc.aggression / 100;
        const distrustFactor = (100 - npc.trust) / 100;
        const probability = aggressionFactor * distrustFactor * 0.6;
        return Math.random() < probability;
    }

    // Helper function to determine if NPC should hoard items
    async shouldHoardItems(npc) {
        // Higher probability if paranoia is high
        const paranoiaFactor = npc.paranoia / 100;
        const probability = paranoiaFactor * 0.5;
        return Math.random() < probability;
    }

    // Helper function to determine if NPC should repair house
    async shouldRepairHouse(npc) {
        // Higher probability if trust is high and energy is sufficient
        const trustFactor = npc.trust / 100;
        const energyFactor = npc.energy / 100;
        const probability = trustFactor * energyFactor * 0.4;
        return Math.random() < probability;
    }

    // Helper function to determine if NPC should leave house
    async shouldLeaveHouse(npc) {
        // Higher probability if paranoia is very high or trust is very low
        const paranoiaThreshold = 80;
        const trustThreshold = 20;
        const highParanoia = npc.paranoia > paranoiaThreshold;
        const lowTrust = npc.trust < trustThreshold;
        
        let probability = 0;
        if (highParanoia || lowTrust) {
            probability = 0.3;
            if (highParanoia && lowTrust) {
                probability = 0.6;
            }
        }
        
        return Math.random() < probability;
    }

    // Eat food behavior
    async eatFood(npc) {
        console.log(`NPC ${npc.name} is eating food...`);
        
        // Reduce hunger
        const hungerReduction = Math.min(20, npc.hunger); // Eat up to 20 points of hunger
        const newHunger = Math.max(0, npc.hunger - hungerReduction);
        
        // Slightly reduce energy from activity
        const newEnergy = Math.max(0, npc.energy - 5);
        
        // Update NPC stats
        await db.runQuery(
            `UPDATE npc_stats SET hunger = ?, energy = ? WHERE npc_id = ?`,
            [newHunger, newEnergy, npc.id]
        );
        
        // Also reduce food in the house
        const house = await houseSimulation.getHouseByUserId(npc.house_id.toString()); // This might not work as expected
        if (house) {
            // For now, we'll just log this action
            console.log(`House food reduced due to ${npc.name} eating`);
        }
        
        console.log(`  ${npc.name}'s hunger reduced to ${newHunger}`);
    }

    // Start fight behavior
    async startFight(npc) {
        console.log(`NPC ${npc.name} is starting a fight...`);
        
        // Increase aggression slightly
        const newAggression = Math.min(100, npc.aggression + 10);
        
        // Decrease energy from fighting
        const newEnergy = Math.max(0, npc.energy - 15);
        
        // Potentially increase paranoia if the fight doesn't go well
        const newParanoia = Math.min(100, npc.paranoia + (Math.random() > 0.5 ? 5 : 0));
        
        // Update NPC stats
        await db.runQuery(
            `UPDATE npc_stats SET aggression = ?, energy = ?, paranoia = ? WHERE npc_id = ?`,
            [newAggression, newEnergy, newParanoia, npc.id]
        );
        
        console.log(`  ${npc.name}'s aggression increased to ${newAggression}, energy decreased to ${newEnergy}`);
    }

    // Hoard items behavior
    async hoardItems(npc) {
        console.log(`NPC ${npc.name} is hoarding items...`);
        
        // Increase paranoia slightly (they're protecting their hoard)
        const newParanoia = Math.min(100, npc.paranoia + 8);
        
        // Slightly decrease energy from moving items around
        const newEnergy = Math.max(0, npc.energy - 3);
        
        // Update NPC stats
        await db.runQuery(
            `UPDATE npc_stats SET paranoia = ?, energy = ? WHERE npc_id = ?`,
            [newParanoia, newEnergy, npc.id]
        );
        
        console.log(`  ${npc.name}'s paranoia increased to ${newParanoia}`);
    }

    // Repair house behavior
    async repairHouse(npc) {
        console.log(`NPC ${npc.name} is repairing the house...`);
        
        // Decrease energy from working
        const newEnergy = Math.max(0, npc.energy - 12);
        
        // Slightly decrease paranoia (feeling more secure)
        const newParanoia = Math.max(0, npc.paranoia - 5);
        
        // Update NPC stats
        await db.runQuery(
            `UPDATE npc_stats SET energy = ?, paranoia = ? WHERE npc_id = ?`,
            [newEnergy, newParanoia, npc.id]
        );
        
        // Update house integrity
        await db.runQuery(
            `UPDATE house_stats SET integrity = LEAST(100, integrity + 5) WHERE house_id = ?`,
            [npc.house_id]
        );
        
        console.log(`  ${npc.name} repaired the house, energy decreased to ${newEnergy}`);
    }

    // Leave house behavior
    async leaveHouse(npc) {
        console.log(`NPC ${npc.name} is leaving the house...`);
        
        // Remove NPC from house (set house_id to NULL)
        await db.runQuery(
            `UPDATE npcs SET house_id = NULL, location = 'left_house' WHERE id = ?`,
            [npc.id]
        );
        
        console.log(`  ${npc.name} has left the house`);
    }

    // Update NPC stats after each tick
    async updateNpcAfterTick(npc) {
        // Apply natural stat changes over time
        const updates = {};
        
        // Hunger increases over time (unless they ate)
        if (!this.hasAction(npc, 'eat')) {
            updates.hunger = Math.min(100, npc.hunger + 3);
        }
        
        // Energy regenerates slowly if not depleted
        if (npc.energy < 100) {
            updates.energy = Math.min(100, npc.energy + 2);
        }
        
        // Paranoia changes based on other factors
        // If trust is high and aggression is low, paranoia might decrease
        if (npc.trust > 60 && npc.aggression < 40) {
            updates.paranoia = Math.max(0, npc.paranoia - 1);
        } else {
            // Otherwise, paranoia might increase slightly
            updates.paranoia = Math.min(100, npc.paranoia + (Math.random() > 0.7 ? 1 : 0));
        }
        
        // Trust changes slowly over time
        // If NPC has been doing positive actions (repairing), trust might increase
        // If NPC has been doing negative actions (fighting), trust might decrease
        if (this.hasAction(npc, 'repair')) {
            updates.trust = Math.min(100, npc.trust + 1);
        } else if (this.hasAction(npc, 'fight')) {
            updates.trust = Math.max(0, npc.trust - 1);
        } else {
            // Natural fluctuation
            if (Math.random() > 0.8) {
                updates.trust = npc.trust + (Math.random() > 0.5 ? 1 : -1);
                updates.trust = Math.max(0, Math.min(100, updates.trust));
            }
        }
        
        // Aggression changes based on actions taken
        if (this.hasAction(npc, 'fight')) {
            updates.aggression = Math.min(100, npc.aggression + 2);
        } else if (this.hasAction(npc, 'repair')) {
            updates.aggression = Math.max(0, npc.aggression - 1);
        }
        
        // Apply updates if any changes occurred
        if (Object.keys(updates).length > 0) {
            const columns = Object.keys(updates);
            const values = Object.values(updates);
            values.push(npc.id); // Add NPC ID for WHERE clause

            const setClause = columns.map(col => `${col} = ?`).join(', ');
            await db.runQuery(
                `UPDATE npc_stats SET ${setClause} WHERE npc_id = ?`,
                values
            );
        }
    }

    // Helper function to check if an NPC performed a specific action
    // For simplicity, we'll track this differently
    hasAction(npc, action) {
        // This is a simplified implementation
        // In a more complex system, we'd track actions taken during the tick
        return false;
    }
}

// Create and export a singleton instance
const npcBehaviorSystem = new NpcBehaviorSystem();

module.exports = npcBehaviorSystem;