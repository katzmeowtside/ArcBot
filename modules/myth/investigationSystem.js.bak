const db = require('../../database.js');
const renderer = require('../../graphics/renderer.js');

class UrbanMythGenerator {
    constructor() {
        this.myths = new Map(); // In-memory cache for active myths
        
        // Possible locations for urban myths
        this.locations = [
            'abandoned warehouse',
            'old subway tunnel',
            'derelict hospital',
            'city park at night',
            'rooftop of a skyscraper',
            'underground parking garage',
            'deserted mall',
            'old cemetery',
            'sewer system',
            'abandoned apartment building',
            'city library after midnight',
            'old theater',
            'abandoned factory',
            'city bridge',
            'dark alley',
            'empty school building',
            'old mansion',
            'construction site',
            'public restroom',
            'basement of city hall'
        ];
        
        // Possible phenomena for urban myths
        this.phenomena = [
            'strange lights in the sky',
            'ghostly apparitions',
            'mysterious disappearances',
            'unexplained sounds',
            'shadowy figures',
            'floating objects',
            'time distortions',
            'dimensional rifts',
            'shape-shifting creatures',
            'teleporting entities',
            'inexplicable cold spots',
            'objects moving on their own',
            'whispers from empty rooms',
            'mirrors showing different reflections',
            'elevators going to non-existent floors',
            'doors leading to impossible spaces',
            'animals behaving strangely',
            'people aging rapidly',
            'gravity anomalies',
            'electromagnetic disturbances'
        ];
        
        // Possible witness reports for urban myths
        this.witnessReports = [
            'A local resident reported seeing %phenomenon% while walking their dog at %time% near %location%.',
            'Security footage from a nearby business captured %phenomenon% at approximately %time%. Authorities are investigating.',
            'Multiple witnesses claim to have experienced %phenomenon% in the %location% area. Local police have received several reports.',
            'A late-night jogger described encountering %phenomenon% while passing through %location% around %time%.',
            'Workers at a nearby establishment reported unusual activity involving %phenomenon% near %location%.',
            'Social media is buzzing with videos allegedly showing %phenomenon% occurring at %location%.',
            'A group of friends witnessed %phenomenon% while exploring %location% and managed to capture some blurry footage.',
            'Local news received an anonymous tip about %phenomenon% happening regularly at %location%.',
            'A child claimed to have seen %phenomenon% while playing near %location%, frightening parents in the area.',
            'Several people reported their electronic devices malfunctioning while experiencing %phenomenon% at %location%.',
            'A night shift employee noticed %phenomenon% while working late at %location% and called authorities.',
            'Residents near %location% have complained about strange noises consistent with %phenomenon%.',
            'A photographer accidentally captured evidence of %phenomenon% while shooting at %location%.',
            'A delivery driver reported encountering %phenomenon% during a routine stop at %location%.',
            'A homeless person living near %location% claims to have witnessed %phenomenon% on multiple occasions.',
            'A paranormal investigator documented %phenomenon% during a visit to %location% last week.',
            'A group of teenagers reported experiencing %phenomenon% while hanging out at %location% after school.',
            'A taxi driver picked up a passenger who claimed to have just escaped an encounter with %phenomenon% near %location%.',
            'A local artist claims inspiration from visions of %phenomenon% while sketching at %location%.',
            'A pet owner reported their animal acting fearfully near %location%, possibly sensing %phenomenon%.'
        ];
        
        this.times = [
            'midnight',
            'early morning',
            'around dawn',
            'late evening',
            'just after sunset',
            'during the witching hour',
            'in the middle of the night',
            'before sunrise',
            'after midnight',
            'around 3 AM'
        ];
    }

    // Generate a random urban myth
    generateUrbanMyth() {
        const location = this.locations[Math.floor(Math.random() * this.locations.length)];
        const phenomenon = this.phenomena[Math.floor(Math.random() * this.phenomena.length)];
        const time = this.times[Math.floor(Math.random() * this.times.length)];
        
        // Select a random witness report template and fill in the placeholders
        const template = this.witnessReports[Math.floor(Math.random() * this.witnessReports.length)];
        const witnessReport = template
            .replace('%phenomenon%', phenomenon)
            .replace('%location%', location)
            .replace('%time%', time);
        
        return {
            id: Date.now() + Math.floor(Math.random() * 10000), // Simple ID generation
            location: location,
            phenomenon: phenomenon,
            witness_report: witnessReport,
            created_at: new Date(),
            status: 'active', // active, investigated, solved, ongoing
            difficulty: Math.floor(Math.random() * 3) + 1, // 1-3 difficulty level
            clues_found: 0,
            progress: 0 // 0-100%
        };
    }

    // Create a new urban myth in the database
    async createUrbanMyth() {
        const myth = this.generateUrbanMyth();
        
        // Insert the myth into the database
        const result = db.createUrbanMyth(
            myth.location,
            myth.phenomenon,
            myth.witness_report,
            myth.status,
            myth.difficulty
        );
        
        // Update the myth ID to the one from the database
        myth.id = result.lastInsertRowid;
        
        // Cache the myth
        this.myths.set(myth.id, myth);
        
        return myth;
    }

    // Get an urban myth by ID
    async getUrbanMythById(mythId) {
        // First check cache
        if (this.myths.has(mythId)) {
            return this.myths.get(mythId);
        }
        
        // Then check database
        const myth = db.getUrbanMythById(mythId);
        
        if (myth) {
            // Cache it
            this.myths.set(mythId, myth);
        }
        
        return myth;
    }

    // Get a random active urban myth
    async getRandomActiveMyth() {
        const myths = db.getActiveUrbanMyths();
        
        if (myths.length > 0) {
            const myth = myths[0];
            // Cache it
            this.myths.set(myth.id, myth);
            return myth;
        }
        
        // If no active myths, create one
        return await this.createUrbanMyth();
    }

    // Update myth progress
    async updateMythProgress(mythId, progressIncrement = 0, cluesIncrement = 0) {
        const myth = await this.getUrbanMythById(mythId);
        
        if (!myth) {
            throw new Error('Myth not found');
        }
        
        const newProgress = Math.min(100, myth.progress + progressIncrement);
        const newClues = myth.clues_found + cluesIncrement;
        
        // Update the database
        db.updateUrbanMythProgress(mythId, newProgress, newClues);
        
        // Update cache
        if (this.myths.has(mythId)) {
            const cachedMyth = this.myths.get(mythId);
            cachedMyth.progress = newProgress;
            cachedMyth.clues_found = newClues;
        }
        
        // Check if myth is solved
        if (newProgress >= 100) {
            await this.markMythAsSolved(mythId);
        }
        
        return {
            id: mythId,
            progress: newProgress,
            clues_found: newClues,
            solved: newProgress >= 100
        };
    }

    // Mark a myth as solved
    async markMythAsSolved(mythId) {
        db.markMythAsSolved(mythId);
        
        // Update cache
        if (this.myths.has(mythId)) {
            const cachedMyth = this.myths.get(mythId);
            cachedMyth.status = 'solved';
        }
    }

    // Generate a visual representation of the urban myth
    async generateMythImage(mythId) {
        const myth = await this.getUrbanMythById(mythId);
        
        if (!myth) {
            throw new Error('Myth not found');
        }
        
        const prompt = `A cinematic, atmospheric image of ${myth.phenomenon} at an ${myth.location}. 
        Style: urban mystery, paranormal, highly detailed, spooky, cinematic lighting, 8k resolution.`;
        
        console.log(`Generating myth image for myth ID ${mythId} with prompt: ${prompt}`);
        
        return await renderer.generateImage(prompt, '16:9');
    }

    // Get all urban myths
    async getAllUrbanMyths() {
        const myths = db.getAllUrbanMyths();
        
        // Cache all myths
        for (const myth of myths) {
            this.myths.set(myth.id, myth);
        }
        
        return myths;
    }

    // Get myths by status
    async getMythsByStatus(status) {
        const myths = db.getMythsByStatus(status);
        
        // Cache all myths
        for (const myth of myths) {
            this.myths.set(myth.id, myth);
        }
        
        return myths;
    }
}

// Create and export a singleton instance
const urbanMythGenerator = new UrbanMythGenerator();

// Create the urban_myths table if it doesn't exist
db.runQuery(`
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

module.exports = urbanMythGenerator;