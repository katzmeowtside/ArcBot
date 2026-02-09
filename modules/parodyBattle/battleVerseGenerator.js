const battleEngine = require('./battleEngine.js');
const contentSafetyFilter = require('./contentSafetyFilter.js');

/**
 * Generate a battle verse for User A targeting User B
 * @param {string} userAName - Name of User A (the one generating the verse)
 * @param {string} userBName - Name of User B (the target of the diss)
 * @param {string} toneLevel - The tone level ('mild', 'chaotic', 'feral')
 * @returns {string} Formatted verse text
 */
function generateBattleVerseRound1(userAName, userBName, toneLevel) {
    // Define templates for diss verses based on tone
    const dissTemplates = {
        mild: [
            `Yo, I'm {userA}, and {userB} can't compete,\nWith my flow so smooth, theirs is looking weak.\nThey think they're hot, but they're just not right,\nI'm the king of this battle, they're taking flight.`,
            
            `Listen here {userB}, you think you're so cool,\nBut next to me, you're just a fool.\nMy rhymes are clean, yours are a mess,\nIn this parody battle, I must confess.`,
            
            `Step aside {userB}, let a real artist shine,\nYour lyrics are boring, mine are divine.\nI craft my verses with precision and care,\nWhile yours sound like they don't even dare.`,
            
            `{userB}, you tried but you fell flat,\nMy verses are golden, yours are just chat.\nI bring the heat while you bring the cold,\nThis battle was won before it was told.`,
            
            `You think you're clever, {userB} my friend,\nBut your rhymes are weak, mine transcend.\nI'm painting pictures with words so fine,\nWhile you're still learning how to rhyme.`
        ],
        chaotic: [
            `Yo yo yo, {userA} in the place to be,\n{userB}, your rhymes are making me flee!\nChaos and madness, that's my domain,\nYou're playing checkers while I'm playing chess with the rain!`,
            
            `Look at little {userB} trying to spit fire,\nBut I'm a whole volcano, taking you higher!\nMy words are electric, yours are just static,\nIn this chaotic battle, I'm dramatically drastic!`,
            
            `{userB}, {userB}, why do you persist?\nI'm a tornado of lyrics, you can't resist!\nMadness and chaos flow through my veins,\nWhile you're stuck in a loop, caught in the rains!`,
            
            `Hold up, hold up, {userB} needs to chill,\nI'm spitting fire while you're standing still!\nMy rhymes are chaotic, yours are mundane,\nIn this battle of wits, I'm driving the lane!`,
            
            `Check it, check it, {userB} you're in my zone,\nI'm spitting chaos while you're on your phone!\nWords flying everywhere like a hurricane,\nWhile you're still learning how to spit and refrain!`
        ],
        feral: [
            `RAWR! I'm {userA}, and I'm breaking free,\n{userB}, your rhymes are nothing to me!\nFeral and wild, that's my domain,\nI'll tear through your verses like a hurricane!`,
            
            `Listen close {userB}, I'm going beast mode,\nMy rhymes will leave you lost on life's road.\nI'm primal and fierce, you're just a pet,\nIn this feral battle, I won't forget!`,
            
            `{userB}, you dare to challenge my throne?\nI'll savage your rhymes and leave you alone!\nWild and untamed, that's how I flow,\nYour verses are dead, mine steal the show!`,
            
            `I'm a lyrical predator, hunting my prey,\n{userB}, you're dinner at the end of the day!\nFeral instincts kicking in, claws bared,\nYour amateur hour just got impaired!`,
            
            `Howl! I'm {userA}, fierce and bold,\n{userB}, your story's getting old!\nUntamed power flowing through my veins,\nI'll feast on your rhymes, driving you insane!`
        ]
    };

    // Select a template based on the tone level
    const templates = dissTemplates[toneLevel] || dissTemplates.mild;
    let selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders with actual names
    selectedTemplate = selectedTemplate.replace(/{userA}/g, userAName);
    selectedTemplate = selectedTemplate.replace(/{userB}/g, userBName);
    
    // Add some random survival-themed elements if we want to tie into the game systems
    const survivalElements = [
        "scavenging for beats",
        "boarding up holes in your flow",
        "generator of sick rhymes",
        "fixing leaks in your metaphors",
        "scavenging for better wordplay",
        "fighting off the night with fire bars",
        "mending holes in your delivery",
        "hoarding better punchlines"
    ];
    
    // Add a survival element based on tone intensity
    let intensityFactor;
    switch(toneLevel) {
        case 'feral': intensityFactor = 0.8; break;
        case 'chaotic': intensityFactor = 0.6; break;
        case 'mild': 
        default: intensityFactor = 0.3; break;
    }
    
    if (Math.random() < intensityFactor) {
        const survivalElement = survivalElements[Math.floor(Math.random() * survivalElements.length)];
        selectedTemplate += `\n(Also ${survivalElement}!)`;
    }
    
    // Format the verse with battle indicators
    const formattedVerse = `🎤 **BATTLE VERSE ROUND 1** 🎤\n` +
                          `**${userAName.toUpperCase()} TARGETING ${userBName.toUpperCase()}**\n` +
                          `**TONE: ${toneLevel.toUpperCase()}**\n\n` +
                          `${selectedTemplate}\n\n` +
                          `🔥 *${userAName} brings the heat!* 🔥`;
    
    // Apply content safety filter
    const filteredResult = contentSafetyFilter.filterBattleVerse(formattedVerse);
    
    return filteredResult.content;
}

module.exports = {
    generateBattleVerseRound1
};