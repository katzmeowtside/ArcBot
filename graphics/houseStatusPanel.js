const fs = require('fs');
const path = require('path');
const renderer = require('./renderer.js');

class HouseStatusPanel {
    constructor() {
        // Define colors for different stats
        this.colors = {
            integrity: '#4CAF50',  // Green
            heat: '#FF9800',       // Orange
            food: '#FFEB3B',       // Yellow
            noise: '#F44336',      // Red
            power: '#2196F3'       // Blue
        };
        
        // Define labels for different stats
        this.labels = {
            integrity: 'Integrity',
            heat: 'Heat',
            food: 'Food',
            noise: 'Noise',
            power: 'Power'
        };
    }

    // Render the house status panel
    async render(houseStats, filename = 'house-status-panel.png') {
        // Validate input
        if (!this.validateInput(houseStats)) {
            throw new Error('Invalid house stats input. Expected object with integrity, heat, food, noise, power values between 0 and 100.');
        }

        // Create a canvas (using mock canvas from the renderer)
        const canvas = renderer.createCanvas(800, 600);
        canvas.setBackground('#1e1e1e'); // Dark gray background
        
        // Draw title
        canvas.drawText('House Status Panel', 50, 50, '#ffffff', 32);
        
        // Define positions for the bars
        const startY = 120;
        const barHeight = 40;
        const barSpacing = 30;
        const barWidth = 500;
        const labelX = 60;
        const barStartX = 250;
        
        // Draw each stat bar
        let currentY = startY;
        for (const [key, value] of Object.entries(houseStats)) {
            if (['integrity', 'heat', 'food', 'noise', 'power'].includes(key)) {
                // Draw label
                canvas.drawText(`${this.labels[key]}:`, labelX, currentY + barHeight/2 + 8, '#ffffff', 20);
                
                // Draw bar background
                canvas.drawRectangle(barStartX, currentY, barWidth, barHeight, '#555555');
                
                // Calculate filled width based on percentage
                const filledWidth = (value / 100) * barWidth;
                
                // Draw filled portion of the bar
                canvas.drawRectangle(barStartX, currentY, filledWidth, barHeight, this.colors[key]);
                
                // Draw percentage text
                canvas.drawText(`${Math.round(value)}%`, barStartX + barWidth + 20, currentY + barHeight/2 + 8, '#ffffff', 20);
                
                // Move to next bar position
                currentY += barHeight + barSpacing;
            }
        }
        
        // Draw additional info if available
        if (houseStats.name) {
            canvas.drawText(`House: ${houseStats.name}`, 50, currentY + 50, '#ffffff', 24);
        }
        
        if (houseStats.owner) {
            canvas.drawText(`Owner: ${houseStats.owner}`, 50, currentY + 90, '#ffffff', 20);
        }
        
        // Save the image to the renders folder
        const filepath = path.join('./renders', filename);
        await canvas.saveAsPNG(filepath);
        
        return filepath;
    }

    // Validate the input JSON
    validateInput(input) {
        if (!input || typeof input !== 'object') {
            return false;
        }
        
        // Check that all required stats are present and are numbers between 0 and 100
        const requiredStats = ['integrity', 'heat', 'food', 'noise', 'power'];
        for (const stat of requiredStats) {
            if (!(stat in input)) {
                return false;
            }
            
            const value = input[stat];
            if (typeof value !== 'number' || value < 0 || value > 100) {
                return false;
            }
        }
        
        return true;
    }
}

// Export a singleton instance
module.exports = new HouseStatusPanel();