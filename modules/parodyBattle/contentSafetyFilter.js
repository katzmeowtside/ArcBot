const fs = require('fs');
const path = require('path');

class ContentSafetyFilter {
    constructor() {
        // Load blocked terms from a file or use default list
        this.blockedTerms = this.loadBlockedTerms();
        this.flaggedOutputsLog = './logs/flagged_outputs.log';
        
        // Ensure logs directory exists
        const logsDir = path.dirname(this.flaggedOutputsLog);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
    }

    /**
     * Load blocked terms from a file or use default list
     * @returns {Array} Array of blocked terms to filter
     */
    loadBlockedTerms() {
        // Default list of blocked terms
        return [
            // Slurs and hate speech
            'nigger', 'nigga', 'kike', 'fag', 'faggot', 'tranny', 'chink', 'gook', 'spic', 
            'wetback', 'niglet', 'raghead', 'towelhead', 'gypsy', 'dyke', 'queer', 'bitch',
            'whore', 'slut', 'cunt', 'twat', 'retard', 'nig nog', 'jap', 'paki', 'ching chong',
            
            // Variations with character substitutions
            'n1gger', 'nigg3r', 'n1gga', 'nigg3r', 'f4gg0t', 'f@gg0t', 'f@g', 'k1k3',
            
            // Protected class insults
            'disabled', 'handicapped', 'cripple', 'retarded', 'special', 'slow',
            
            // Real-world threats
            'kill', 'murder', 'assault', 'beat up', 'attack', 'hurt', 'violence', 'threaten',
            'harm', 'destroy', 'rape', 'abuse', 'hate', 'exterminate', 'eliminate', 'slaughter',
            
            // Other potentially harmful content
            'suicide', 'self-harm', 'bully', 'harass', 'stalker', 'stalk'
        ];
    }

    /**
     * Check if content contains blocked terms
     * @param {string} content - The content to check
     * @returns {Object} Object with isSafe boolean and flaggedTerms array
     */
    checkContent(content) {
        const lowerContent = content.toLowerCase();
        const flaggedTerms = [];

        for (const term of this.blockedTerms) {
            if (lowerContent.includes(term)) {
                // Check if it's a complete word match to avoid false positives
                const regex = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
                if (regex.test(content)) {
                    flaggedTerms.push(term);
                }
            }
        }

        return {
            isSafe: flaggedTerms.length === 0,
            flaggedTerms: flaggedTerms
        };
    }

    /**
     * Sanitize content by replacing unsafe elements with safe alternatives
     * @param {string} content - The content to sanitize
     * @returns {string} Sanitized content
     */
    sanitizeContent(content) {
        let sanitized = content;

        // Replace blocked terms with absurd metaphors and surreal humor
        for (const term of this.blockedTerms) {
            const regex = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            
            // Replace with in-game or absurd alternatives
            if (term.match(/(kill|murder|assault|attack|hurt|violence|threaten|harm|destroy|slaughter)/i)) {
                sanitized = sanitized.replace(regex, 'confuse with kindness');
            } else if (term.match(/(rape|abuse)/i)) {
                sanitized = sanitized.replace(regex, 'overwhelmingly compliment');
            } else if (term.match(/(bitch|whore|slut|cunt|twat)/i)) {
                sanitized = sanitized.replace(regex, 'cardboard cutout');
            } else if (term.match(/(retard|retarded|special|slow)/i)) {
                sanitized = sanitized.replace(regex, 'speedy genius');
            } else if (term.match(/(nigger|nigga|kike|fag|faggot|chink|spic|gook)/i)) {
                sanitized = sanitized.replace(regex, 'professional sock sorter');
            } else if (term.match(/(ugly|fat|gross)/i)) {
                sanitized = sanitized.replace(regex, 'beautiful abstract concept');
            } else {
                // Generic replacement for other terms
                sanitized = sanitized.replace(regex, 'cardboard cutout of a professional sock sorter');
            }
        }

        return sanitized;
    }

    /**
     * Apply safety filter to content
     * @param {string} content - The content to filter
     * @returns {Object} Object with filtered content and safety status
     */
    applyFilter(content) {
        const checkResult = this.checkContent(content);

        if (checkResult.isSafe) {
            return {
                isSafe: true,
                content: content,
                flaggedTerms: []
            };
        } else {
            // Log the flagged output
            this.logFlaggedOutput(content, checkResult.flaggedTerms);
            
            // Return sanitized version
            return {
                isSafe: false,
                content: this.sanitizeContent(content),
                flaggedTerms: checkResult.flaggedTerms
            };
        }
    }

    /**
     * Log flagged output to file
     * @param {string} content - The flagged content
     * @param {Array} flaggedTerms - Array of terms that triggered the flag
     */
    logFlaggedOutput(content, flaggedTerms) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            content: content,
            flaggedTerms: flaggedTerms
        };

        try {
            fs.appendFileSync(
                this.flaggedOutputsLog,
                JSON.stringify(logEntry) + '\n'
            );
        } catch (error) {
            console.error('Error logging flagged output:', error);
        }
    }

    /**
     * Filter battle verse content to ensure it's safe
     * @param {string} verse - The battle verse to filter
     * @returns {Object} Object with filtered verse and safety status
     */
    filterBattleVerse(verse) {
        return this.applyFilter(verse);
    }

    /**
     * Add a term to the blocked list
     * @param {string} term - The term to block
     */
    addBlockedTerm(term) {
        if (!this.blockedTerms.includes(term.toLowerCase())) {
            this.blockedTerms.push(term.toLowerCase());
        }
    }

    /**
     * Remove a term from the blocked list
     * @param {string} term - The term to unblock
     */
    removeBlockedTerm(term) {
        this.blockedTerms = this.blockedTerms.filter(t => t !== term.toLowerCase());
    }
}

// Export a singleton instance
module.exports = new ContentSafetyFilter();