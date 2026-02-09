const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.js');
const CommandHandler = require('./commandHandler.js');
const db = require('./database.js'); // Initialize database
const scheduler = require('./scheduler.js'); // Initialize scheduler

// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// Initialize command handler
const commandHandler = new CommandHandler(client);

// When the client is ready, run this code
client.once('ready', () => {
    console.log('Bot Online');
    
    // Initialize command handler
    commandHandler.initialize()
        .then(() => console.log('Command handler initialized'))
        .catch(console.error);
    
    // Start the scheduler
    scheduler.start();
});

// Login to Discord with your app's token
client.login(config.token);