const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config.js');

class MockCanvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.backgroundColor = '#000000'; // Default black background
    }

    // Set background color
    setBackground(color) {
        this.backgroundColor = color;
    }

    // Mock drawing function
    drawRectangle(x, y, width, height, color) {
        // console.log(`Drawing rectangle at (${x},${y}) with size ${width}x${height} in color ${color}`);
    }

    // Mock drawing function
    drawText(text, x, y, color, fontSize) {
        // console.log(`Drawing text "${text}" at (${x},${y}) in color ${color} with size ${fontSize}`);
    }

    // Mock save function that creates a placeholder file
    async saveAsPNG(filepath) {
        // Create a placeholder file that represents the "rendered" image
        const placeholderContent = `Mock Image Data\nDimensions: ${this.width}x${this.height}\nBackground: ${this.backgroundColor}\nGenerated at: ${new Date().toISOString()}`;
        
        // Ensure the renders directory exists
        const rendersDir = path.dirname(filepath);
        if (!fs.existsSync(rendersDir)) {
            fs.mkdirSync(rendersDir, { recursive: true });
        }
        
        // Write the placeholder file
        fs.writeFileSync(filepath, placeholderContent);
        console.log(`Mock image saved to ${filepath}`);
    }
}

class GraphicsRenderer {
    constructor() {
        // Ensure renders directory exists
        if (!fs.existsSync('./renders')) {
            fs.mkdirSync('./renders', { recursive: true });
        }
        this.apiKey = process.env.GOOGLE_API_KEY;
        if (this.apiKey) {
            console.log('GOOGLE_API_KEY found in environment.');
        } else {
            console.warn('GOOGLE_API_KEY NOT found in environment!');
        }
    }

    // Create a new canvas (Mock for now, or could use node-canvas if installed)
    createCanvas(width = 1024, height = 1024) {
        return new MockCanvas(width, height);
    }

    // Generate an image using Google Imagen 4 API
    async generateImage(prompt, aspectRatio = '1:1') {
        if (!this.apiKey) {
            console.warn('GOOGLE_API_KEY not found in environment variables. Using mock renderer.');
            return this.renderTestImage(`mock-${Date.now()}.png`);
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${this.apiKey}`;
        console.log(`Calling Imagen API with prompt: "${prompt}"`);
        
        try {
            const response = await axios.post(url, {
                instances: [
                    {
                        prompt: prompt
                    }
                ],
                parameters: {
                    aspectRatio: aspectRatio,
                    sampleCount: 1
                }
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Imagen API response received.');

            if (response.data && response.data.predictions && response.data.predictions[0] && response.data.predictions[0].bytesBase64Encoded) {
                const base64Image = response.data.predictions[0].bytesBase64Encoded;
                const buffer = Buffer.from(base64Image, 'base64');
                const filename = `imagen-${Date.now()}.png`;
                const filepath = path.join('./renders', filename);

                fs.writeFileSync(filepath, buffer);
                console.log(`Image generated and saved to ${filepath}`);
                return filepath;
            } else {
                throw new Error('Invalid response structure from Imagen API');
            }
        } catch (error) {
            console.error('Error generating image with Imagen API:', error.message);
            if (error.response) {
                console.error('API Response:', error.response.data);
            }
            // Fallback to mock renderer on error
            return this.renderTestImage(`fallback-${Date.now()}.png`);
        }
    }

    // Render a simple test image
    async renderTestImage(filename = 'test-image.png') {
        const canvas = this.createCanvas(1024, 1024);
        canvas.setBackground('#4a90e2'); // Set background to blue
        
        // Perform some mock drawing operations
        canvas.drawRectangle(50, 50, 200, 100, '#ff0000');
        canvas.drawText('Test Image', 100, 100, '#ffffff', 24);
        
        // Save the image to the renders folder
        const filepath = path.join('./renders', filename);
        await canvas.saveAsPNG(filepath);
        
        return filepath;
    }

    // General render function
    async render(data, filename) {
        // If data is a string, assume it's a prompt for Imagen
        if (typeof data === 'string') {
            return this.generateImage(data);
        }

        const canvas = this.createCanvas(1024, 1024);
        
        // Apply background if specified
        if (data.backgroundColor) {
            canvas.setBackground(data.backgroundColor);
        }
        
        // Perform drawing operations based on data
        if (data.elements) {
            for (const element of data.elements) {
                switch (element.type) {
                    case 'rectangle':
                        canvas.drawRectangle(
                            element.x, 
                            element.y, 
                            element.width, 
                            element.height, 
                            element.color
                        );
                        break;
                    case 'text':
                        canvas.drawText(
                            element.text, 
                            element.x, 
                            element.y, 
                            element.color, 
                            element.fontSize
                        );
                        break;
                }
            }
        }
        
        // Save the image to the renders folder
        const filepath = path.join('./renders', filename);
        await canvas.saveAsPNG(filepath);
        
        return filepath;
    }
}

// Export the renderer
module.exports = new GraphicsRenderer();