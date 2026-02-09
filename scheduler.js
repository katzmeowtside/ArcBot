const cron = require('node-cron');
const EventEmitter = require('events');

class GameScheduler extends EventEmitter {
    constructor() {
        super();
        this.task = null;
        this.isRunning = false;
    }

    // Start the scheduler
    start() {
        if (this.isRunning) {
            console.log('Scheduler is already running');
            return;
        }

        // Schedule task to run every 5 minutes
        // Using cron expression: */5 * * * * means every 5 minutes
        this.task = cron.schedule('*/5 * * * *', () => {
            console.log(`Tick event emitted at ${new Date().toISOString()}`);
            this.emit('tick');
        }, {
            scheduled: true,
            timezone: "UTC"
        });

        this.isRunning = true;
        console.log('Game scheduler started, running every 5 minutes');
    }

    // Stop the scheduler
    stop() {
        if (this.task) {
            this.task.stop();
            this.isRunning = false;
            console.log('Game scheduler stopped');
        }
    }

    // Method for modules to subscribe to tick events
    subscribe(callback) {
        this.on('tick', callback);
        return () => this.unsubscribe(callback); // Return unsubscribe function
    }

    // Method to unsubscribe from tick events
    unsubscribe(callback) {
        this.removeListener('tick', callback);
    }
}

// Create a singleton instance
const scheduler = new GameScheduler();

module.exports = scheduler;