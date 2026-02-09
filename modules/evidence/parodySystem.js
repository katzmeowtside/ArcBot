const db = require('../../database.js');

class ParodyLyricsGenerator {
    constructor() {
        // Common song structures and templates
        this.chorusTemplates = {
            mild: [
                "Oh {topic}, {topic}, {topic} so bright,\nWhy won't you come to me tonight?\n{topic}, {topic}, shining light,\nIn this world of {topic} delight!",
                
                "{topic}, {topic}, {topic} again,\nSpinning round and round like a friend.\n{topic}, {topic}, {topic} so true,\nI'll keep singing songs of you!",
                
                "When I see {topic}, I feel so free,\n{topic} brings out the best in me.\nEvery day and every night,\n{topic} makes everything feel right!",
                
                "La la la, {topic} everywhere,\n{topic} dancing in the air.\nTake my hand and come along,\n{topic} is where we both belong!",
                
                "Hey {topic}, hey {topic}, what's the deal?\n{topic} is something that's so real.\nIn the morning, in the night,\n{topic} fills me with delight!"
            ],
            chaotic: [
                "Oh {topic}, {topic}, {topic} so wild,\nGot me spinning like a child!\n{topic}, {topic}, driving me insane,\nDancing in the cosmic rain!",
                
                "{topic}, {topic}, {topic} on speed,\nWhat I do is what I need.\n{topic}, {topic}, {topic} so loud,\nScreaming to the crowd!",
                
                "When I see {topic}, I lose my mind,\n{topic} makes me lose all rhyme.\nEvery thought becomes a blur,\n{topic} makes me want to purr!",
                
                "La la la, {topic} gone berserk,\n{topic} made my brain go perple!\nGrab my head and hold it tight,\n{topic} sends me into flight!",
                
                "Hey {topic}, hey {topic}, what the heck?\n{topic} is driving me mental wreck.\nIn the chaos, in the noise,\n{topic} makes me lose my voice!"
            ],
            feral: [
                "{topic}, {topic}, {topic} in my brain,\nDriving me insane, driving me insane!\n{topic}, {topic}, {topic} so raw,\nFeelings that I can't withdraw!",
                
                "Oh {topic}, {topic}, {topic} so deranged,\nReality feels rearranged.\n{topic}, {topic}, {topic} so unhinged,\nMy sanity is now estranged!",
                
                "When I see {topic}, I go berserk,\n{topic} makes me want to lurk.\nEvery nerve is firing fast,\n{topic} makes me want to blast!",
                
                "La la la, {topic} in my head,\n{topic} made me go stark raving red!\nCrazy thoughts are all around,\n{topic} has me feeling unbound!",
                
                "Hey {topic}, hey {topic}, what a trip,\n{topic} makes me want to flip.\nMind is gone, mind is lost,\n{topic} has me totally crossed!"
            ]
        };
        
        this.verseTemplates = {
            mild: [
                "I was walking down the street one day,\nWhen I saw {topic} in a different way.\nIt was glowing, it was bright,\nMade me feel like I could fly so high!",
                
                "Yesterday I knew I had to change,\nThen I met {topic}, so strange.\nNow I dance and sing with glee,\n{topic} is all I'll ever need!",
                
                "Sometimes life feels like a maze,\nBut {topic} lights up my days.\nThrough the darkness, through the pain,\n{topic} helps me dance in rain!",
                
                "Friends all told me I was wrong,\nThat {topic} wouldn't last too long.\nBut I kept believing in my heart,\n{topic} would never fall apart!",
                
                "In the corner of my room,\n{topic} banished all my gloom.\nNow I'm laughing at the sky,\n{topic} taught me how to fly!",
                
                "There's a shadow in the night,\n{topic} makes it feel so bright.\nEven when the world seems mad,\n{topic} makes me glad!",
                
                "I remember when we met,\n{topic} was quite a threat.\nBut now we're friends until the end,\n{topic} is my bestest friend!"
            ],
            chaotic: [
                "I was walking down the street one day,\nWhen {topic} came out to play.\nIt was wiggling, it was shaking,\nMade my brain feel like it's breaking!",
                
                "Yesterday I knew I had to run,\n{topic} was having way too much fun.\nNow I'm jumping, now I'm screaming,\n{topic} has me feeling gleaming!",
                
                "Sometimes life feels like a joke,\n{topic} makes it quite a yoke.\nThrough the madness, through the noise,\n{topic} makes me lose my poise!",
                
                "Friends all told me to be calm,\nBut {topic} caused quite a balm.\nNow I'm spinning, now I'm swaying,\n{topic} has me reeling, swaying!",
                
                "In the corner of my room,\n{topic} caused quite a boom.\nNow I'm twitching, now I'm shaking,\n{topic} has me feeling awake!",
                
                "There's a buzz inside my head,\n{topic} made me go ahead.\nEven when the world gets weird,\n{topic} makes me feel revered!",
                
                "I remember when we met,\n{topic} caused quite a fret.\nBut now we're crazy, wild and free,\n{topic} is my destiny!"
            ],
            feral: [
                "I was stumbling through the haze,\nWhen {topic} set my soul ablaze.\nIt was snarling, it was growling,\nMade my mind feel like it's howling!",
                
                "Yesterday I lost control,\n{topic} took a massive toll.\nNow I'm thrashing, now I'm raging,\n{topic} has me feeling feral, caging!",
                
                "Sometimes life feels like a void,\n{topic} makes me feel destroyed.\nThrough the chaos, through the pain,\n{topic} drives me insane!",
                
                "Friends all warned me to stay sane,\nBut {topic} drove me insane.\nNow I'm roaring, now I'm breaking,\n{topic} has me feeling naked, shaking!",
                
                "In the depths of my despair,\n{topic} made me lose my hair.\nNow I'm howling at the moon,\n{topic} made me lose my tune!",
                
                "There's a beast inside my chest,\n{topic} made it feel obsessed.\nEven when the world feels dead,\n{topic} makes me feel unfed!",
                
                "I remember when we fought,\n{topic} brought me to my knot.\nBut now we're wild, untamed and free,\n{topic} is my destiny!"
            ]
        };
        
        this.absurdTopics = [
            "pizza rolls", "rubber ducks", "socks that disappear", 
            "the mystery of Tuesday", "why do birds", "monday blues (but purple)",
            "my pet cactus named Gerald", "the conspiracy of comfortable chairs",
            "quantum physics for toddlers", "why ceiling fans hate me",
            "the secret society of houseplants", "my ongoing feud with gravity",
            "the loneliness of single gloves", "my relationship with WiFi",
            "the existential crisis of a traffic cone", "my thoughts on toast"
        ];
        
        this.songStyles = [
            "pop", "rock", "hip-hop", "country", "disco", "punk", "indie", 
            "folk", "electronic", "metal", "jazz", "blues", "reggae"
        ];
        
        // Survival-themed elements
        this.survivalElements = [
            "generator failures", "boarded windows", "paranoia", "scrap scavenging", 
            "night arguments", "leaky pipes", "broken locks", "flickering lights",
            "moldy walls", "rusty nails", "cardboard beds", "canned food",
            "rat infestations", "blackouts", "freezing nights", "squeaky floors",
            "strange sounds", "lonely echoes", "cold drafts", "rotting wood",
            "missing supplies", "flickering candles", "thin walls", "scary shadows"
        ];
        
        this.survivalTopics = [
            "abandoned house", "squatter", "urban survival", "house npc", 
            "survival", "apocalypse", "post-apocalyptic", "scavenger", 
            "refugee", "homeless", "shelter", "survivor", "ruined building",
            "derelict", "desolate", "isolated", "neglected", "forgotten"
        ];
    }
    
    // Check if the topic is survival-themed
    isSurvivalThemed(topic) {
        const lowerTopic = topic.toLowerCase();
        return this.survivalTopics.some(survivalTopic => 
            lowerTopic.includes(survivalTopic)
        );
    }

    // Generate parody lyrics based on song title, topic, and tone
    generateParody(songTitle, topic, tone = 'mild') {
        // Determine if this is a survival-themed topic
        const isSurvivalThemed = this.isSurvivalThemed(topic);
        
        // Determine the song style based on the title
        const style = this.determineSongStyle(songTitle);
        
        // Create the parody structure with the specified tone
        const parodyStructure = this.createParodyStructure(topic, style, tone, isSurvivalThemed);
        
        // Format the lyrics
        const formattedLyrics = this.formatLyrics(songTitle, topic, parodyStructure, tone, isSurvivalThemed);
        
        return formattedLyrics;
    }

    // Determine song style based on title
    determineSongStyle(title) {
        // Simple heuristic to determine style based on keywords
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('love') || lowerTitle.includes('heart') || lowerTitle.includes('baby')) {
            return 'pop';
        } else if (lowerTitle.includes('rock') || lowerTitle.includes('roll') || lowerTitle.includes('hard')) {
            return 'rock';
        } else if (lowerTitle.includes('country') || lowerTitle.includes('truck') || lowerTitle.includes('farm')) {
            return 'country';
        } else if (lowerTitle.includes('dance') || lowerTitle.includes('disco') || lowerTitle.includes('groove')) {
            return 'disco';
        } else if (lowerTitle.includes('punk') || lowerTitle.includes('angry') || lowerTitle.includes('rebel')) {
            return 'punk';
        } else {
            // Choose randomly from available styles
            return this.songStyles[Math.floor(Math.random() * this.songStyles.length)];
        }
    }

    // Create the parody structure with verses and chorus
    createParodyStructure(topic, style, tone = 'mild', isSurvivalThemed = false) {
        const structure = {
            style: style,
            verses: [],
            chorus: ""
        };
        
        // Generate 3-5 verses
        const numVerses = Math.floor(Math.random() * 3) + 3; // 3 to 5 verses
        
        for (let i = 0; i < numVerses; i++) {
            // Select a verse template based on tone and replace the topic
            const toneTemplates = this.verseTemplates[tone] || this.verseTemplates.mild;
            let verseTemplate = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
            verseTemplate = verseTemplate.replace(/\{topic\}/g, topic);
            
            // Add survival-themed elements if applicable
            if (isSurvivalThemed) {
                verseTemplate = this.addSurvivalElements(verseTemplate, topic);
            }
            
            // Add some randomness to make it more absurd (more so for higher tones)
            verseTemplate = this.addAbsurdity(verseTemplate, topic, tone, isSurvivalThemed);
            
            structure.verses.push(verseTemplate);
        }
        
        // Generate chorus based on tone
        const toneChorusTemplates = this.chorusTemplates[tone] || this.chorusTemplates.mild;
        const chorusTemplate = toneChorusTemplates[Math.floor(Math.random() * toneChorusTemplates.length)];
        structure.chorus = chorusTemplate.replace(/\{topic\}/g, topic);
        
        // Add survival-themed elements to chorus if applicable
        if (isSurvivalThemed) {
            structure.chorus = this.addSurvivalElements(structure.chorus, topic);
        }
        
        return structure;
    }

    // Add survival-themed elements to the lyrics
    addSurvivalElements(line, topic) {
        // Add a survival element to the line
        const survivalElement = this.survivalElements[Math.floor(Math.random() * this.survivalElements.length)];
        
        // Randomly decide where to add the survival element
        const position = Math.floor(Math.random() * 3); // 0, 1, or 2
        
        switch(position) {
            case 0:
                // Add at the beginning
                return `During ${survivalElement}, ${line}`;
            case 1:
                // Add in the middle
                const parts = line.split(',');
                if (parts.length > 1) {
                    const midIndex = Math.floor(parts.length / 2);
                    parts.splice(midIndex, 0, `with ${survivalElement}`);
                    return parts.join(',');
                } else {
                    return `${line} (with ${survivalElement})`;
                }
            case 2:
            default:
                // Add at the end
                return `${line}\n(All while dealing with ${survivalElement}!)`;
        }
    }

    // Add absurd elements to make lyrics more chaotic
    addAbsurdity(verse, topic, tone = 'mild', isSurvivalThemed = false) {
        // Determine intensity based on tone
        let absurdChance, chaoticLineChance, bridgeChance;
        
        switch(tone) {
            case 'feral':
                absurdChance = 0.8;
                chaoticLineChance = 0.9;
                bridgeChance = 0.8;
                break;
            case 'chaotic':
                absurdChance = 0.7;
                chaoticLineChance = 0.8;
                bridgeChance = 0.7;
                break;
            case 'mild':
            default:
                absurdChance = 0.5;
                chaoticLineChance = 0.7;
                bridgeChance = 0.6;
        }
        
        // Increase chances if it's survival-themed
        if (isSurvivalThemed) {
            absurdChance = Math.min(1.0, absurdChance + 0.1);
            chaoticLineChance = Math.min(1.0, chaoticLineChance + 0.1);
            bridgeChance = Math.min(1.0, bridgeChance + 0.1);
        }
        
        // Sometimes add an absurd topic in parentheses
        if (Math.random() < absurdChance) {
            const absurdTopic = this.absurdTopics[Math.floor(Math.random() * this.absurdTopics.length)];
            verse += `\n(Also featuring ${absurdTopic}!)`;
        }
        
        // Sometimes add a random chaotic line
        if (Math.random() < chaoticLineChance) {
            let chaoticLines = [
                `And ${topic} said "Booyah!" to the moon!`,
                `While ${topic} danced with a spoon!`,
                `Then ${topic} challenged a balloon!`,
                `And ${topic} painted the room!`,
                `As ${topic} played the loom!`
            ];
            
            // Add survival-themed chaotic lines if applicable
            if (isSurvivalThemed) {
                chaoticLines = chaoticLines.concat([
                    `While ${topic} fixed the generator again!`,
                    `As ${topic} boarded up another window!`,
                    `While ${topic} scavenged for scraps!`,
                    `As ${topic} argued through the night!`,
                    `While ${topic} checked for intruders!`
                ]);
            }
            
            verse += `\n${chaoticLines[Math.floor(Math.random() * chaoticLines.length)]}`;
        }
        
        // Sometimes add a "bridge" section
        if (Math.random() < bridgeChance) {
            let bridges = [
                `But wait, there's more! ${topic} grows!`,
                `Plot twist: ${topic} knows!`,
                `Surprise! ${topic} glows!`,
                `Secret: ${topic} flows!`,
                `Revelation: ${topic} shows!`
            ];
            
            // Add survival-themed bridges if applicable
            if (isSurvivalThemed) {
                bridges = bridges.concat([
                    `But the generator died again!`,
                    `Just as paranoia crept in!`,
                    `Right when the lights went out!`,
                    `As the walls started closing in!`,
                    `When the rats came out to play!`
                ]);
            }
            
            verse += `\n${bridges[Math.floor(Math.random() * bridges.length)]}`;
        }
        
        // For chaotic and feral tones, add extra chaotic elements
        if (tone === 'chaotic' || tone === 'feral') {
            if (Math.random() > 0.5) {
                let extraChaos = [
                    `*Spontaneous interpretive dance break*`,
                    `*Uncontrollable laughter*`,
                    `*Mind blown*`,
                    `*Reality distortion field activated*`,
                    `*Existential crisis averted*`
                ];
                
                // Add survival-themed chaos if applicable
                if (isSurvivalThemed) {
                    extraChaos = extraChaos.concat([
                        `*Generator sputters and dies*`,
                        `*Boarded window rattles ominously*`,
                        `*Scavenging instincts kick in*`,
                        `*Paranoia levels: critical*`,
                        `*Night terrors begin*`
                    ]);
                }
                
                verse += `\n${extraChaos[Math.floor(Math.random() * extraChaos.length)]}`;
            }
        }
        
        // For feral tone, add even more intense elements
        if (tone === 'feral') {
            if (Math.random() > 0.4) {
                let feralElements = [
                    `*Roars into the void*`,
                    `*Sanity levels: critically low*`,
                    `*Brain.exe has stopped working*`,
                    `*Logic circuits overloaded*`,
                    `*Mental barriers breached*`
                ];
                
                // Add survival-themed feral elements if applicable
                if (isSurvivalThemed) {
                    feralElements = feralElements.concat([
                        `*Survival instincts override all*`,
                        `*Scavenging mode: activated*`,
                        `*Paranoia: maximum*`,
                        `*Shelter: compromised*`,
                        `*Nightmare fuel: maxed out*`
                    ]);
                }
                
                verse += `\n${feralElements[Math.floor(Math.random() * feralElements.length)]}`;
            }
        }
        
        return verse;
    }

    // Format the lyrics nicely
    formatLyrics(songTitle, topic, structure, tone = 'mild', isSurvivalThemed = false) {
        let lyrics = `🎵 **PARODY OF "${songTitle}"** 🎵\n`;
        lyrics += `**TOPIC: "${topic}"**\n`;
        lyrics += `**STYLE: ${structure.style.toUpperCase()}**\n`;
        lyrics += `**TONE: ${tone.toUpperCase()}**\n`;
        if (isSurvivalThemed) {
            lyrics += `**THEME: SURVIVAL SIMULATION**\n`;
        }
        lyrics += `\n`;
        
        // Add verses and chorus in a typical song structure
        // Usually: Verse 1, Chorus, Verse 2, Chorus, Verse 3, Chorus, (sometimes Verse 4, Chorus)
        for (let i = 0; i < structure.verses.length; i++) {
            lyrics += `**VERSE ${i + 1}:**\n`;
            lyrics += `${structure.verses[i]}\n\n`;
            
            // Add chorus after each verse except the last one
            if (i < structure.verses.length - 1) {
                lyrics += `**CHORUS:**\n`;
                lyrics += `${structure.chorus}\n\n`;
            }
        }
        
        // Add final chorus
        lyrics += `**CHORUS (FINAL):**\n`;
        lyrics += `${structure.chorus}\n\n`;
        
        // Add a funny outro sometimes (more chaotic for higher tones)
        if (Math.random() > 0.5) {
            let outros = [
                `(*) Disclaimer: No actual ${topic} were harmed in the making of these lyrics.`,
                `(+) Sung best while standing on one foot.`,
                `(#) May cause uncontrollable giggling.`,
                `(!) Side effects may include sudden urge to dance.`,
                `(%) Not recommended during thunderstorms.`
            ];
            
            // Add more chaotic outros for higher tones
            if (tone === 'chaotic' || tone === 'feral') {
                outros = outros.concat([
                    `(*) Warning: May cause temporary loss of sanity.`,
                    `(+) Side effects include uncontrollable fits of laughter.`,
                    `(#) Not responsible for any existential crises.`,
                    `(!) May result in spontaneous interpretive dance.`,
                    `(%) Contains traces of pure chaos.`
                ]);
            }
            
            if (tone === 'feral') {
                outros = outros.concat([
                    `(*) Mental health not guaranteed.`,
                    `(+) May cause reality distortion.`,
                    `(#) Feral mode engaged - proceed with caution.`,
                    `(!) Emergency sanity protocols deployed.`,
                    `(%) Maximum chaos achieved.`
                ]);
            }
            
            // Add survival-themed outros if applicable
            if (isSurvivalThemed) {
                outros = outros.concat([
                    `(*) Generator not included. Batteries sold separately.`,
                    `(+) Boarded windows not guaranteed to keep out squirrels.`,
                    `(#) Scavenging license not required but recommended.`,
                    `(!) Paranoia levels may vary.`,
                    `(%) Night terrors sold as-is, no warranty.`,
                    `(*) Survival not guaranteed, refunds only in canned goods.`
                ]);
            }
            
            lyrics += `*${outros[Math.floor(Math.random() * outros.length)]}*`;
        }
        
        return lyrics;
    }

    // Store a generated parody in the database
    async storeParody(originalTitle, topic, lyrics, tone = 'mild') {
        try {
            db.createParodyLyrics(originalTitle, topic, lyrics, tone);
            return true;
        } catch (error) {
            console.error('Error storing parody:', error);
            return false;
        }
    }

    // Get a random stored parody
    async getRandomStoredParody() {
        try {
            return db.getRandomParody();
        } catch (error) {
            console.error('Error retrieving parody:', error);
            return null;
        }
    }
}

// Create and export a singleton instance
const parodyGenerator = new ParodyLyricsGenerator();

// Create the parody_lyrics table if it doesn't exist
db.runQuery(`
    CREATE TABLE IF NOT EXISTS parody_lyrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_title TEXT NOT NULL,
        topic TEXT NOT NULL,
        lyrics TEXT NOT NULL,
        style TEXT DEFAULT 'comedy',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = parodyGenerator;