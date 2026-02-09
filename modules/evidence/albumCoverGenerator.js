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
        
        // Construct a prompt for Imagen
        const prompt = `A ${style} style album cover art for a band named "${bandName}" titled "${albumTitle}". 
        The cover should feature elements related to "${parodyTopic}" and "${songTitle}". 
        Visual style: ${style}, urban decay, grunge aesthetic, artistic, high quality, 4k. 
        Text on cover: "${bandName}" and "${albumTitle}".`;

        console.log(`Generating album cover with prompt: ${prompt}`);

        // Use the renderer to generate the image via Imagen API
        const filepath = await renderer.generateImage(prompt, '1:1');
        
        return {
            filepath: filepath,
            bandName: bandName,
            albumTitle: albumTitle,
            subtitle: subtitle
        };
    }
}

// Export a singleton instance
module.exports = new AlbumCoverGenerator();