const fs = require('fs');
const path = require('path');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
    }

    // Load commands from modules folder
    async loadCommands() {
        const modulesPath = path.join(__dirname, 'modules');
        
        // Check if modules directory exists
        if (!fs.existsSync(modulesPath)) {
            console.log('Modules directory not found, skipping command loading.');
            return;
        }

        // Get all subdirectories in modules folder
        const moduleDirs = fs.readdirSync(modulesPath);

        for (const moduleDir of moduleDirs) {
            const modulePath = path.join(modulesPath, moduleDir);
            
            // Check if it's a directory
            if (fs.lstatSync(modulePath).isDirectory()) {
                // Look for command files in the module directory
                const commandFiles = fs.readdirSync(modulePath).filter(file => 
                    file.endsWith('.js')
                );

                for (const file of commandFiles) {
                    const filePath = path.join(modulePath, file);
                    
                    try {
                        const command = require(filePath);
                        
                        // Validate command structure
                        if (!command.data || !command.execute) {
                            console.warn(`Command ${filePath} is missing required properties (data or execute). Skipping...`);
                            continue;
                        }

                        // Set the command in the map
                        this.commands.set(command.data.name, command);
                        console.log(`Loaded command: ${command.data.name} from ${filePath}`);
                    } catch (error) {
                        console.error(`Error loading command from ${filePath}:`, error);
                    }
                }
            }
        }
    }

    // Register commands to Discord
    async registerCommands() {
        try {
            const { REST, Routes } = require('discord.js');
            const rest = new REST().setToken(require('./config.js').token);

            // Prepare commands data for registration
            const commandsData = [];
            for (const [name, command] of this.commands) {
                commandsData.push(command.data.toJSON());
            }

            console.log(`Started refreshing ${commandsData.length} application (/) commands.`);

            // Register commands globally (this can take up to 1 hour to propagate)
            const data = await rest.put(
                Routes.applicationCommands(this.client.user.id),
                { body: commandsData }
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error('Error registering commands:', error);
        }
    }

    // Initialize the command handler
    async initialize() {
        await this.loadCommands();
        
        // Register commands when client is ready
        this.client.once('clientReady', async () => {
            await this.registerCommands();
        });

        // Handle interactions
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;

            const command = this.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                // Execute command asynchronously
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing command ${interaction.commandName}:`, error);

                // Reply with error message if possible
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'There was an error while executing this command!',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: 'There was an error while executing this command!',
                        ephemeral: true
                    });
                }
            }
        });
    }
}

module.exports = CommandHandler;