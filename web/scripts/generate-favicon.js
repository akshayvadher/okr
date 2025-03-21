const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [32, 64];
const svgPath = path.join(__dirname, '../public/app/favicon.svg');

async function generateFavicon() {
    try {
        // Generate PNG favicon
        await sharp(svgPath)
            .resize(32, 32)
            .png()
            .toFile(path.join(__dirname, '../public/app/favicon.png'));

        // Generate larger PNG for Apple devices
        await sharp(svgPath)
            .resize(64, 64)
            .png()
            .toFile(path.join(__dirname, '../public/app/favicon-64.png'));

        console.log('Favicons generated successfully!');
    } catch (error) {
        console.error('Error generating favicons:', error);
    }
}

generateFavicon(); 