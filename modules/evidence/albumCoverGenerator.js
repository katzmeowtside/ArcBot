const fs = require('fs');
const path = require('path');
const renderer = require('../../graphics/renderer.js');

class AlbumCoverGenerator {
    constructor() {
        // Band name generators for different styles
        this.bandNameGenerators = {
            grunge: [
                "Soggy Carpet", "Rusty Faucet", "Broken Dreams", "Moldy Bread", 
                "Leaky Pipes", "Cardboard Heroes", "Flickering Bulbs", "Scavenger Kings",
                "Rat Infestation", "Black Mold", "Cold Draft", "Squeaky Floors"
            ],
            punk: [
                "Angry Squirrels", "Toxic Waste", "Broken Glass", "Screaming Beans",
                "Rebel Raisins", "Anarchist Ants", "Chaos Crew", "Punk Pigeons"
            ],
            indie: [
                "Lonely Echo", "Fading Light", "Cardboard Castle", "Empty Rooms",
                "Silent Screams", "Flickering Hope", "Neglected Garden", "Forgotten Keys"
            ]
        };
        
        // Album title generators
        this.albumTitleGenerators = [
            "Surviving Another Day", "Scavenging Sessions", "Generator Blues", 
            "Boarded Windows", "Paranoia Diaries", "Night Shift", "Urban Decay",
            "Squatter's Lament", "House of Cards", "Broken Locks", "Cold Nights",
            "Rusty Nails", "Moldy Walls", "Missing Supplies", "Flickering Lights"
        ];
        
        // Subtitle generators
        this.subtitleGenerators = [
            "A Survival Anthology", "Songs from the Streets", "Urban Chronicles", 
            "Abandoned Hymns", "Squatter's Ballads", "Post-Apocalyptic Folk",
            "Scavenger Tunes", "Homeless Harmonies", "Derelict Ditties"
        ];
    }

    // Generate a random band name based on style
    generateBandName(style = 'grunge') {
        const generatorSet = this.bandNameGenerators[style] || this.bandNameGenerators.grunge;
        const firstPart = generatorSet[Math.floor(Math.random() * generatorSet.length)];
        const secondPart = generatorSet[Math.floor(Math.random() * generatorSet.length)];
        
        // Sometimes use just one part, sometimes combine two
        if (Math.random() > 0.5) {
            return firstPart;
        } else {
            return `${firstPart} ${secondPart}`;
        }
    }

    // Generate a random album title
    generateAlbumTitle() {
        return this.albumTitleGenerators[Math.floor(Math.random() * this.albumTitleGenerators.length)];
    }

    // Generate a random subtitle
    generateSubtitle() {
        return this.subtitleGenerators[Math.floor(Math.random() * this.subtitleGenerators.length)];
    }

    // Generate an album cover with grunge/urban decay theme
    async generateAlbumCover(songTitle, parodyTopic, originalStyle = 'grunge') {
        // Determine the style based on the topic
        let style = originalStyle;
        if (parodyTopic.toLowerCase().includes('punk') || parodyTopic.toLowerCase().includes('rebel')) {
            style = 'punk';
        } else if (parodyTopic.toLowerCase().includes('indie') || parodyTopic.toLowerCase().includes('folk')) {
            style = 'indie';
        }
        
        // Generate band name, album title, and subtitle
        const bandName = this.generateBandName(style);
        const albumTitle = this.generateAlbumTitle();
        const subtitle = this.generateSubtitle();
        
        // Create a canvas (using mock canvas from the renderer)
        const canvas = renderer.createCanvas(800, 800); // Square album cover
        
        // Create grunge/urban decay background
        this.createGrungeBackground(canvas, style);
        
        // Add title text
        this.addTitleText(canvas, songTitle, 400, 150);
        
        // Add parody subtitle
        this.addSubtitleText(canvas, `${parodyTopic} Parody`, 400, 220);
        
        // Add band name
        this.addBandName(canvas, `by ${bandName}`, 400, 300);
        
        // Add album title
        this.addAlbumTitle(canvas, albumTitle, 400, 400);
        
        // Add subtitle
        this.addSmallText(canvas, subtitle, 400, 450);
        
        // Add some grunge effects
        this.addGrungeEffects(canvas);
        
        // Save the image to the renders folder
        const filename = `album-cover-${Date.now()}.png`;
        const filepath = path.join('./renders', filename);
        await canvas.saveAsPNG(filepath);
        
        return {
            filepath: filepath,
            bandName: bandName,
            albumTitle: albumTitle,
            subtitle: subtitle
        };
    }

    // Create grunge/urban decay background
    createGrungeBackground(canvas, style) {
        // Base color based on style
        let bgColor;
        switch(style) {
            case 'punk':
                bgColor = '#8B0000'; // Dark red
                break;
            case 'indie':
                bgColor = '#556B2F'; // Dark olive green
                break;
            case 'grunge':
            default:
                bgColor = '#2F4F4F'; // Dark slate gray
        }
        
        canvas.setBackground(bgColor);
        
        // Add some texture effects (simulated)
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 800;
            const size = Math.random() * 10 + 2;
            const alpha = Math.random() * 0.3 + 0.1;
            
            // Simulate texture with rectangles
            canvas.drawRectangle(x, y, size, size, `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${alpha})`);
        }
    }

    // Add title text
    addTitleText(canvas, text, x, y) {
        // Add some distortion to the position
        const distortedX = x + (Math.random() * 10 - 5);
        const distortedY = y + (Math.random() * 10 - 5);
        
        canvas.drawText(text, distortedX, distortedY, '#FFFFFF', 36);
    }

    // Add subtitle text
    addSubtitleText(canvas, text, x, y) {
        // Add some distortion to the position
        const distortedX = x + (Math.random() * 8 - 4);
        const distortedY = y + (Math.random() * 8 - 4);
        
        canvas.drawText(text, distortedX, distortedY, '#CCCCCC', 24);
    }

    // Add band name
    addBandName(canvas, text, x, y) {
        // Add some distortion to the position
        const distortedX = x + (Math.random() * 6 - 3);
        const distortedY = y + (Math.random() * 6 - 3);
        
        canvas.drawText(text, distortedX, distortedY, '#FFD700', 28);
    }

    // Add album title
    addAlbumTitle(canvas, text, x, y) {
        // Add some distortion to the position
        const distortedX = x + (Math.random() * 8 - 4);
        const distortedY = y + (Math.random() * 8 - 4);
        
        canvas.drawText(text, distortedX, distortedY, '#FFA500', 32);
    }

    // Add small text
    addSmallText(canvas, text, x, y) {
        // Add some distortion to the position
        const distortedX = x + (Math.random() * 5 - 2.5);
        const distortedY = y + (Math.random() * 5 - 2.5);
        
        canvas.drawText(text, distortedX, distortedY, '#AAAAAA', 18);
    }

    // Add grunge effects
    addGrungeEffects(canvas) {
        // Add some scratch marks (simulated)
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 800;
            const length = Math.random() * 50 + 10;
            const angle = Math.random() * Math.PI * 2;
            
            // Simulate scratches with thin rectangles
            const width = Math.random() * 2 + 0.5;
            const height = Math.random() * 3 + 1;
            
            // Just draw small rectangles to simulate scratches
            canvas.drawRectangle(x, y, width, height, `rgba(255, 255, 255, ${Math.random() * 0.1})`);
        }
        
        // Add some stains (simulated)
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 800;
            const size = Math.random() * 50 + 20;
            
            // Simulate stains with circles
            canvas.drawRectangle(x, y, size, size/2, `rgba(${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, ${Math.random() * 0.1})`);
        }
    }
}

// Export a singleton instance
module.exports = new AlbumCoverGenerator();